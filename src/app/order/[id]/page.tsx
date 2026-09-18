import { Header } from "@/components/store/Header";
import { Footer } from "@/components/store/Footer";
import { OrderTracking } from "@/components/store/OrderTracking";
import { db } from "@/lib/db";
export const dynamic="force-dynamic";
export default async function OrderPage({params}:{params:Promise<{id:string}>}){const {id}=await params;const rows=await db.setting.findMany();const settings=Object.fromEntries(rows.map(x=>[x.key,x.value]));return <><Header siteName={settings.site_name}/><OrderTracking id={id}/><Footer settings={settings}/></>}
