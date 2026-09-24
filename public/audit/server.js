import http from 'node:http';
import https from 'node:https';
import dns from 'node:dns/promises';
import net from 'node:net';
import { readFile } from 'node:fs/promises';

const PORT = 4317;
const MAX_BYTES = 250_000;
const privateAddress = ip => {
  if (net.isIP(ip) === 6) {
    const x = ip.toLowerCase();
    return x === '::1' || x === '::' || x.startsWith('fc') || x.startsWith('fd') || x.startsWith('fe8') || x.startsWith('fe9') || x.startsWith('fea') || x.startsWith('feb') || x.startsWith('::ffff:');
  }
  const [a,b] = ip.split('.').map(Number);
  return a === 0 || a === 10 || a === 127 || a >= 224 || a === 169 && b === 254 || a === 172 && b >= 16 && b <= 31 || a === 192 && b === 168 || a === 100 && b >= 64 && b <= 127 || a === 198 && (b === 18 || b === 19);
};
async function publicUrl(input) {
  const url = new URL(input);
  if (url.protocol !== 'https:' || url.username || url.password || url.port && url.port !== '443') throw Error('Нужен публичный HTTPS-адрес без порта и учётных данных');
  const host = url.hostname.toLowerCase();
  if (host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.local') || host.endsWith('.internal') || host.endsWith('.test')) throw Error('Внутренний адрес не поддерживается');
  const addresses = await dns.lookup(host, { all:true });
  if (!addresses.length || addresses.some(x => privateAddress(x.address))) throw Error('Адрес указывает во внутреннюю сеть');
  return { url, address:addresses[0].address, family:addresses[0].family };
}
async function request(input, method='GET', body, redirects=0) {
  const {url,address,family} = await publicUrl(input);
  return new Promise((resolve,reject) => {
    const req=https.request(url, {method, timeout:6500, lookup:(_host,_options,cb)=>cb(null,address,family), headers:{'user-agent':'SiteAuditor/1.0 (+local security review)','accept':'text/html,application/json;q=0.9,*/*;q=0.2', ...(body?{'content-type':'application/json','content-length':Buffer.byteLength(body)}:{})}}, res=>{
      const chunks=[]; let size=0;
      res.on('data',chunk=>{size+=chunk.length;if(size<=MAX_BYTES)chunks.push(chunk);});
      res.on('end',async()=>{
        const location=res.headers.location;
        if ([301,302,303,307,308].includes(res.statusCode) && location && redirects<2) {
          try { const next=new URL(location,url); if(next.origin!==url.origin) throw Error('Перенаправление на другой домен'); resolve(await request(next.href,method,body,redirects+1)); } catch(e){reject(e);} return;
        }
        resolve({status:res.statusCode,headers:res.headers,text:Buffer.concat(chunks).toString('utf8'),bytes:size,url:url.href});
      });
    });
    req.on('timeout',()=>req.destroy(Error('Тайм-аут')));
    req.on('error',reject);
    req.end(body);
  });
}
function item(level,title,detail){return {level,title,detail};}
async function scan(input) {
  const {url}=await publicUrl(input);
  const base=url.origin, findings=[], checks=[];
  const inspect=async (path,method='GET',body)=>{
    try { const r=await request(new URL(path,base).href,method,body); checks.push({method,path,status:r.status,bytes:r.bytes}); return r; }
    catch(e){checks.push({method,path,error:e.message});return null;}
  };
  const home=await inspect('/');
  if (!home) throw Error('Не удалось получить главную страницу');
  const h=home.headers;
  for(const [name,label] of [['strict-transport-security','HSTS'],['content-security-policy','CSP'],['x-content-type-options','X-Content-Type-Options'],['referrer-policy','Referrer-Policy']])
    if(!h[name]) findings.push(item(name==='content-security-policy'?'medium':'low',`Нет ${label}`,'Проверьте, подходит ли этот заголовок архитектуре сайта.'));
  if(h['access-control-allow-origin']==='*') findings.push(item('info','CORS на главной: *','Сам по себе открытый CORS для публичного HTML не означает доступ к закрытым API.'));
  for(const cookie of h['set-cookie']||[]) {
    const name=cookie.split('=')[0];
    if(!/;\s*httponly\b/i.test(cookie)) findings.push(item('medium',`Cookie ${name}: нет HttpOnly`,'Если это cookie сессии, JavaScript может её прочитать.'));
    if(!/;\s*secure\b/i.test(cookie)) findings.push(item('medium',`Cookie ${name}: нет Secure`,'Если это cookie сессии, разрешена передача без HTTPS.'));
    if(!/;\s*samesite=/i.test(cookie)) findings.push(item('low',`Cookie ${name}: нет SameSite`,'Проверьте защиту от межсайтовых запросов.'));
  }
  for(const path of ['/robots.txt','/sitemap.xml','/.well-known/security.txt','/.env','/.git/config','/admin','/api']) {
    const r=await inspect(path);
    if(!r) continue;
    if((path==='/.env'||path==='/.git/config') && r.status===200 && !/^\s*<!doctype html|^\s*<html/i.test(r.text)) findings.push(item('high',`Возможен доступ к ${path}`,'Ответ 200 и не похож на HTML. Проверьте содержимое самостоятельно; сканер его не выводит.'));
    if(path==='/admin' && r.status===200) findings.push(item('info','Маршрут /admin доступен','Проверьте, что его API отдельно требует авторизацию.'));
  }
  const options=await inspect('/api','OPTIONS');
  if(options?.headers['access-control-allow-origin']==='*' && String(options.headers['access-control-allow-methods']||'').match(/POST|PUT|DELETE/)) findings.push(item('medium','Широкий CORS на /api','Проверьте CORS на закрытых API и серверную авторизацию.'));
  // No mutation: POST is directed only to a conventional login endpoint with unusable synthetic input.
  const loginLink= /<form[^>]*(?:login|signin)|href=["'][^"']*\/login/i.test(home.text);
  if(loginLink){
    const login=await inspect('/api/login','POST',JSON.stringify({username:'audit-nonexistent@example.invalid',password:'invalid-audit-only'}));
    if(login?.status===200) findings.push(item('medium','POST /api/login ответил 200 на фиктивные данные','Это не подтверждает вход: проверьте тело ответа и серверную логику вручную.'));
  }
  // Differential check only; generic 500 is a signal, never proof of SQL injection.
  const baseline=await inspect('/?audit_probe=normal');
  const probe=await inspect('/?audit_probe=%27%20OR%20%271%27%3D%271');
  if(baseline && probe && baseline.status<500 && probe.status>=500) findings.push(item('medium','SQL-подобный параметр вызвал ошибку 5xx','Это лишь сигнал: воспроизведите на тестовом окружении и проверьте запросы к БД.'));
  return {target:base,at:new Date().toISOString(),checks,findings,scope:'Публичные HTTP-проверки без входа; SQLi, IDOR и защита POST не подтверждаются автоматически.'};
}
const server=http.createServer(async(req,res)=>{
  res.setHeader('cache-control','no-store'); res.setHeader('x-content-type-options','nosniff'); res.setHeader('content-security-policy',"default-src 'self'; style-src 'self'; script-src 'self'; connect-src 'self'; object-src 'none'");
  if(req.url==='/' && req.method==='GET'){res.setHeader('content-type','text/html; charset=utf-8');res.end(await readFile(new URL('./index.html',import.meta.url)));return;}
  if(req.url==='/style.css' && req.method==='GET'){res.setHeader('content-type','text/css');res.end(await readFile(new URL('./style.css',import.meta.url)));return;}
  if(req.url==='/app.js' && req.method==='GET'){res.setHeader('content-type','text/javascript');res.end(await readFile(new URL('./app.js',import.meta.url)));return;}
  if(req.url==='/scan' && req.method==='POST'){
    try {let text='';for await(const chunk of req){text+=chunk;if(text.length>3000)throw Error('Слишком длинный запрос');}const {url}=JSON.parse(text);const report=await scan(url);res.setHeader('content-type','application/json');res.end(JSON.stringify(report));}
    catch(e){res.statusCode=400;res.setHeader('content-type','application/json');res.end(JSON.stringify({error:e.message}));}return;
  }
  res.statusCode=404;res.end();
});
server.listen(PORT,'127.0.0.1',()=>console.log(`Site Auditor: http://127.0.0.1:${PORT}`));
