<?php
declare(strict_types=1);
session_start(['cookie_httponly'=>true,'cookie_secure'=>!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS']!=='off','cookie_samesite'=>'Strict']);
header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: no-referrer');
header("Content-Security-Policy: default-src 'self'; style-src 'self'; script-src 'self'; object-src 'none'; base-uri 'none'; form-action 'self'");
header('Cache-Control: no-store');
const MAX_REQUESTS=30;
const MAX_BODY=200000;
$secret=require __DIR__.'/config.php';
function reply(array $data,int $status=200):never {http_response_code($status);header('Content-Type: application/json; charset=utf-8');echo json_encode($data,JSON_UNESCAPED_UNICODE|JSON_INVALID_UTF8_SUBSTITUTE);exit;}
function input():array {$raw=file_get_contents('php://input',false,null,0,4096);return json_decode($raw?:'{}',true)?:[];}
function safeHost(string $host):array {
  $host=strtolower(rtrim($host,'.'));
  if(!$host || strlen($host)>253 || !preg_match('/^[a-z0-9.-]+$/',$host) || !str_contains($host,'.') || preg_match('/(^|\.)(localhost|local|internal|test)$/',$host)) throw new RuntimeException('Недопустимый домен');
  $ips=gethostbynamel($host);
  if(!$ips) throw new RuntimeException('Домен не разрешается в публичный IPv4');
  foreach($ips as $ip) if(!filter_var($ip,FILTER_VALIDATE_IP,FILTER_FLAG_IPV4|FILTER_FLAG_NO_PRIV_RANGE|FILTER_FLAG_NO_RES_RANGE)) throw new RuntimeException('Адрес во внутренней сети заблокирован');
  return $ips;
}
function target(string $value):array {
  $u=parse_url($value);
  if(!$u || ($u['scheme']??'')!=='https' || empty($u['host']) || isset($u['user']) || isset($u['pass']) || isset($u['port'])) throw new RuntimeException('Введите публичный HTTPS-адрес без порта');
  $ips=safeHost($u['host']);return ['origin'=>'https://'.strtolower($u['host']),'host'=>strtolower($u['host']),'ip'=>$ips[0]];
}
function fetchSite(array $t,string $path,string $method='GET',?string $post=null):array {
  if(!str_starts_with($path,'/') || str_starts_with($path,'//')) throw new RuntimeException('Недопустимый путь');
  $curl=curl_init($t['origin'].$path);$headers=[];$body='';
  curl_setopt_array($curl,[CURLOPT_RETURNTRANSFER=>false,CURLOPT_FOLLOWLOCATION=>false,CURLOPT_TIMEOUT=>7,CURLOPT_CONNECTTIMEOUT=>4,CURLOPT_PROTOCOLS=>CURLPROTO_HTTPS,CURLOPT_SSL_VERIFYPEER=>true,CURLOPT_SSL_VERIFYHOST=>2,CURLOPT_RESOLVE=>[$t['host'].':443:'.$t['ip']],CURLOPT_USERAGENT=>'UploadAuditor/2.0',CURLOPT_CUSTOMREQUEST=>$method,CURLOPT_HTTPHEADER=>['Accept: text/html, application/json;q=0.7, */*;q=0.2','Cookie:'],CURLOPT_HEADERFUNCTION=>function($c,$line)use(&$headers){$p=strpos($line,':');if($p!==false){$k=strtolower(trim(substr($line,0,$p)));$headers[$k][]=trim(substr($line,$p+1));}return strlen($line);},CURLOPT_WRITEFUNCTION=>function($c,$chunk)use(&$body){if(strlen($body)<MAX_BODY)$body.=substr($chunk,0,MAX_BODY-strlen($body));return strlen($chunk);}]);
  if($post!==null)curl_setopt_array($curl,[CURLOPT_POSTFIELDS=>$post,CURLOPT_HTTPHEADER=>['Content-Type: application/json','Accept: application/json','Cookie:']]);
  $ok=curl_exec($curl);$status=(int)curl_getinfo($curl,CURLINFO_HTTP_CODE);$error=curl_error($curl);curl_close($curl);
  if($ok===false)throw new RuntimeException($error?:'Ошибка соединения');
  return ['status'=>$status,'headers'=>$headers,'body'=>$body];
}
function headerValue(array $r,string $key):string{return $r['headers'][$key][0]??'';}
function finding(array &$out,string $severity,string $title,string $detail):void {$out[]=compact('severity','title','detail');}
function scan(string $address):array {
  $t=target($address);$checks=[];$findings=[];$requests=0;
  $get=function(string $path,string $method='GET',?string $post=null)use($t,&$checks,&$requests){
    if(++$requests>MAX_REQUESTS)throw new RuntimeException('Достигнут лимит запросов');
    try {$r=fetchSite($t,$path,$method,$post);$checks[]=['method'=>$method,'path'=>$path,'status'=>$r['status']];return $r;}
    catch(Throwable $e){$checks[]=['method'=>$method,'path'=>$path,'error'=>'Недоступен'];return null;}
  };
  $home=$get('/');if(!$home)throw new RuntimeException('Не удалось открыть главную страницу');
  foreach(['strict-transport-security'=>'HSTS','content-security-policy'=>'CSP','x-content-type-options'=>'X-Content-Type-Options','referrer-policy'=>'Referrer-Policy'] as $key=>$label)if(!headerValue($home,$key))finding($findings,$key==='content-security-policy'?'medium':'low',"Отсутствует $label",'Проверьте необходимость и настройку заголовка.');
  foreach($home['headers']['set-cookie']??[] as $cookie){$name=substr($cookie,0,strpos($cookie,'=')?:0);if(!preg_match('/;\s*httponly\b/i',$cookie))finding($findings,'medium',"Cookie $name без HttpOnly",'Для сессионных cookies требуется HttpOnly.');if(!preg_match('/;\s*secure\b/i',$cookie))finding($findings,'medium',"Cookie $name без Secure",'Для сессионных cookies требуется Secure.');}
  foreach(['/robots.txt','/sitemap.xml','/.well-known/security.txt','/.env','/.git/config','/admin','/api'] as $path){$r=$get($path);if(!$r)continue;if(in_array($path,['/.env','/.git/config'],true)&&$r['status']===200&&!preg_match('/^\s*<(?:!doctype|html)/i',$r['body']))finding($findings,'high',"Возможна утечка $path",'Получен ответ 200, который не похож на HTML. Содержимое намеренно не показано.');if($path==='/admin'&&$r['status']===200)finding($findings,'info','/admin отвечает 200','Это не доказывает доступ к данным: проверьте защиту API администратора.');}
  $api=$get('/api','OPTIONS');if($api&&headerValue($api,'access-control-allow-origin')==='*'&&preg_match('/POST|PUT|DELETE/i',headerValue($api,'access-control-allow-methods')))finding($findings,'medium','Широкий CORS на /api','Проверьте авторизацию и CORS каждого закрытого маршрута.');
  $admin=$get('/api/admin/health');if($admin&&$admin['status']===200)finding($findings,'medium','Проверка доступа к /api/admin/health','Ответ 200 без авторизации требует ручной проверки структуры ответа.');
  $links=[];preg_match_all('/\b(?:href|action)\s*=\s*["\']([^"\']+)["\']/i',$home['body'],$matches);foreach($matches[1] as $link){$p=parse_url(html_entity_decode($link,ENT_QUOTES));if(!$p)continue;if(isset($p['host'])&&strtolower($p['host'])!==$t['host'])continue;if(!isset($p['query']))continue;parse_str($p['query'],$params);if(!$params)continue;$path=$p['path']??'/';if(!str_starts_with($path,'/')||str_starts_with($path,'//'))continue;$key=array_key_first($params);if(!is_string($key)||strlen($key)>60)continue;$links[$path.'?'.$key]=[$path,$params,$key];if(count($links)>=4)break;}
  foreach($links as [$path,$params,$key]){
    $params[$key]='audit-control';$baseline=$get($path.'?'.http_build_query($params));
    $params[$key]="' OR '1'='1";$candidate=$get($path.'?'.http_build_query($params));
    if($baseline&&$candidate&&$baseline['status']<500&&$candidate['status']>=500)finding($findings,'medium',"SQL-подобный ввод: $path",'Появилась ошибка 5xx. Это сигнал для ручной проверки, а не доказательство SQL-инъекции.');
    if($candidate&&str_contains($candidate['body'],"' OR '1'='1"))finding($findings,'low',"Отражённый параметр: $path",'Проверьте экранирование при выводе HTML; отражение строки не доказывает XSS.');
  }
  if(preg_match('/\b(?:href|action)\s*=\s*["\'][^"\']*\/login\b/i',$home['body'])){
    $login=$get('/api/login','POST',json_encode(['username'=>'audit-nonexistent@example.invalid','password'=>'invalid-audit-only']));
    if($login&&$login['status']===200)finding($findings,'info','Тестовый POST /api/login: ответ 200','Нужно вручную проверить, был ли вход действительно отклонён.');
  }
  return ['target'=>$t['origin'],'checkedAt'=>gmdate('c'),'checks'=>$checks,'findings'=>$findings,'scope'=>'Публичная поверхность без учётной записи. Результаты SQL/XSS являются индикаторами; контроль доступа после входа, IDOR и серверную логику следует проверять отдельно.'];
}
$action=$_GET['action']??'';
if($action==='login'&&$_SERVER['REQUEST_METHOD']==='POST'){
  $attempts=$_SESSION['login_attempts']??0;
  if($attempts>=8)reply(['error'=>'Слишком много попыток. Откройте новую сессию позже.'],429);
  $data=input();$password=(string)($data['password']??'');
  if(hash_equals($secret,hash('sha256',$password))){session_regenerate_id(true);$_SESSION['auditor']=true;$_SESSION['login_attempts']=0;reply(['ok'=>true]);}
  $_SESSION['login_attempts']=$attempts+1;sleep(1);reply(['error'=>'Неверный пароль'],401);
}
if($action==='logout'){$_SESSION=[];session_destroy();reply(['ok'=>true]);}
if($action==='session')reply(['authenticated'=>!empty($_SESSION['auditor'])]);
if($action==='scan'){
  if(empty($_SESSION['auditor']))reply(['error'=>'Требуется вход'],401);
  if($_SERVER['REQUEST_METHOD']!=='POST')reply(['error'=>'Метод не поддерживается'],405);
  if(!hash_equals((string)($_SESSION['csrf']??''),(string)($_SERVER['HTTP_X_CSRF_TOKEN']??'')))reply(['error'=>'CSRF'],403);
  $origin=$_SERVER['HTTP_ORIGIN']??'';$expected=(!empty($_SERVER['HTTPS'])&&$_SERVER['HTTPS']!=='off'?'https':'http').'://'.($_SERVER['HTTP_HOST']??'');if($origin!==$expected)reply(['error'=>'Origin'],403);
  try{$data=input();reply(scan((string)($data['url']??'')));}catch(Throwable $e){reply(['error'=>$e->getMessage()],400);}
}
if(empty($_SESSION['csrf']))$_SESSION['csrf']=bin2hex(random_bytes(24));
?><!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Site Auditor</title><link rel="stylesheet" href="style.css"></head><body><main><div class="eyebrow">SECURITY / PRIVATE WORKSPACE</div><h1>Аудит сайта<span>.</span></h1><p class="lead">Введи адрес сайта и получи отчёт по публичной поверхности: HTTP, заголовки, формы, доступность маршрутов и безопасные тестовые запросы.</p><section id="auth" class="card"><h2>Вход</h2><form id="login"><input type="password" id="password" placeholder="Пароль аудитора" required><button>Войти</button></form></section><section id="workspace" class="card" hidden><div class="heading"><h2>Новая проверка</h2><button id="logout" class="ghost">Выйти</button></div><form id="scan"><input id="url" type="url" placeholder="https://example.com" required><button id="start">Проверить →</button></form><p class="muted">Проверка выполняет до 30 запросов. Отчёт доступен только в текущем браузере и не сохраняется на сервере.</p></section><div id="status" role="status"></div><section id="report" hidden><div class="heading"><div><div class="eyebrow">ОТЧЁТ</div><h2 id="target"></h2><small id="date"></small></div><button id="download" class="ghost">Скачать JSON ↓</button></div><div id="stats"></div><h3>Наблюдения</h3><div id="findings"></div><h3>Запросы</h3><div id="checks"></div><p id="scope" class="muted"></p></section><footer>Локальный аудитор · только для сайтов, которые вы вправе проверять</footer></main><script>window.auditCsrf=<?=json_encode($_SESSION['csrf'])?>;</script><script src="app.js" defer></script></body></html>
