import pandas as pd
import psycopg2
from datetime import date
from decimal import Decimal

DB_CONFIG = {
    "host": "127.0.0.1",
    "port": 8001,
    "user": "postgres",
    "password": "Jr200131",
    "database": "dais_store",
}

def _conn():
    return psycopg2.connect(**DB_CONFIG)

def _bounds(from_date, to_date):
    return from_date or "1970-01-01", to_date or str(date.today())

def _parse(val):
    if isinstance(val, Decimal):
        return float(val)
    if isinstance(val, date):
        return str(val)
    return val

def _dicts(df):
    if df.empty:
        return []
    return [{k: _parse(v) for k, v in row.items()} for _, row in df.iterrows()]

# ── Sales Analysis ──────────────────────────────────────

def _sales_analysis(period, from_date, to_date):
    f, t = _bounds(from_date, to_date)
    period_map = {"daily": "DATE(created_at)", "weekly": "DATE_TRUNC('week', created_at)",
                  "monthly": "DATE_TRUNC('month', created_at)", "annual": "DATE_TRUNC('year', created_at)"}
    trunc = period_map.get(period, "DATE_TRUNC('month', created_at)")
    label = {"daily": "diario", "weekly": "semanal", "monthly": "mensual", "annual": "anual"}.get(period, "mensual")
    with _conn() as conn:
        df = pd.read_sql(f"""
            SELECT {trunc} AS date, COUNT(*)::int AS orders,
                   COALESCE(SUM(total), 0)::numeric AS revenue
            FROM orders
            WHERE created_at >= %s AND created_at <= (%s::date + interval '1 day')
            GROUP BY date ORDER BY date ASC
        """, conn, params=[f, t])
    chart = _dicts(df)
    total_rev = float(df["revenue"].sum()) if not df.empty else 0
    total_ord = int(df["orders"].sum()) if not df.empty else 0
    avg_rev = total_rev / total_ord if total_ord else 0
    peak = df.loc[df["revenue"].idxmax()] if not df.empty else None
    peak_str = f"{str(peak['date'])[:10]} (${float(peak['revenue']):,.0f})" if peak is not None else "—"
    return {
        "data": chart,
        "analysis": (
            f"**Ventas {label}.** Este reporte muestra la evolución de los ingresos y el volumen de pedidos "
            f"en períodos {label}es durante el rango seleccionado. "
            f"Se registraron **{total_ord:,} pedidos** con un ingreso total de **${total_rev:,.0f}**. "
            f"El ingreso promedio por período es de **${avg_rev:,.0f}**. "
            f"El período de mayor actividad fue **{peak_str}**. "
            f"Analice la tendencia para identificar patrones estacionales, meses de mayor demanda "
            f"y oportunidades de crecimiento en períodos bajos."
        ),
        "insights": {
            "total_revenue": round(total_rev, 2),
            "total_orders": total_ord,
            "avg_revenue_per_period": round(avg_rev, 2),
            "peak_period": str(peak["date"])[:10] if peak is not None else None,
            "peak_revenue": float(peak["revenue"]) if peak is not None else 0,
            "period_count": len(chart),
            "trend": "creciente" if len(chart) > 1 and chart[-1]["revenue"] > chart[0]["revenue"] else (
                "decreciente" if len(chart) > 1 and chart[-1]["revenue"] < chart[0]["revenue"] else "estable"
            ),
        },
    }

def _sales_day_of_week(from_date, to_date):
    f, t = _bounds(from_date, to_date)
    with _conn() as conn:
        df = pd.read_sql("""
            SELECT TO_CHAR(created_at, 'Day') AS day_name,
                   EXTRACT(DOW FROM created_at)::int AS dow,
                   COUNT(*)::int AS orders,
                   COALESCE(SUM(total), 0)::numeric AS revenue
            FROM orders
            WHERE created_at >= %s AND created_at <= (%s::date + interval '1 day')
            GROUP BY day_name, dow ORDER BY dow
        """, conn, params=[f, t])
    chart = _dicts(df)
    total_ord = int(df["orders"].sum()) if not df.empty else 0
    total_rev = float(df["revenue"].sum()) if not df.empty else 0
    best_day = df.loc[df["revenue"].idxmax()] if not df.empty else None
    worst_day = df.loc[df["revenue"].idxmin()] if not df.empty else None
    day_names_es = {"Monday": "lunes", "Tuesday": "martes", "Wednesday": "miércoles",
                    "Thursday": "jueves", "Friday": "viernes", "Saturday": "sábado", "Sunday": "domingo"}
    best_name = day_names_es.get(str(best_day["day_name"]).strip(), str(best_day["day_name"]).strip()) if best_day is not None else "—"
    worst_name = day_names_es.get(str(worst_day["day_name"]).strip(), str(worst_day["day_name"]).strip()) if worst_day is not None else "—"
    return {
        "data": chart,
        "analysis": (
            f"**Ventas por día de la semana.** Este diagrama revela la distribución de ingresos y pedidos "
            f"a lo largo de los siete días de la semana, facilitando la identificación de patrones de consumo. "
            f"El día con mayor actividad es **{best_name}** con ${float(best_day['revenue']):,.0f} en ventas, "
            f"mientras que **{worst_name}** presenta la menor actividad con ${float(worst_day['revenue']):,.0f}. "
            f"En total se registraron **{total_ord:,} pedidos** y **${total_rev:,.0f}** en ingresos. "
            f"Use esta información para optimizar promociones, horarios de atención y campañas publicitarias "
            f"según los días de mayor afluencia."
        ),
        "insights": {
            "total_revenue": round(total_rev, 2),
            "total_orders": total_ord,
            "best_day": best_name,
            "best_day_revenue": float(best_day["revenue"]) if best_day is not None else 0,
            "worst_day": worst_name,
            "worst_day_revenue": float(worst_day["revenue"]) if worst_day is not None else 0,
            "days_analyzed": len(chart),
        },
    }

def _sales_by_hour(from_date, to_date):
    f, t = _bounds(from_date, to_date)
    with _conn() as conn:
        df = pd.read_sql("""
            SELECT EXTRACT(HOUR FROM created_at)::int AS hour,
                   COUNT(*)::int AS orders,
                   COALESCE(SUM(total), 0)::numeric AS revenue
            FROM orders
            WHERE created_at >= %s AND created_at <= (%s::date + interval '1 day')
            GROUP BY hour ORDER BY hour
        """, conn, params=[f, t])
    chart = _dicts(df)
    peak_h = df.loc[df["revenue"].idxmax()] if not df.empty else None
    low_h = df.loc[df[df["orders"] > 0]["revenue"].idxmin()] if not df.empty and (df["orders"] > 0).any() else None
    total_ord = int(df["orders"].sum()) if not df.empty else 0
    peak_hr = int(peak_h["hour"]) if peak_h is not None else 0
    def fmt_hr(h):
        return f"{h:02d}:00" if h is not None else "—"
    return {
        "data": chart,
        "analysis": (
            f"**Ventas por hora del día.** Este gráfico muestra la concentración de pedidos e ingresos "
            f"en cada hora del día, permitiendo identificar los horarios de mayor demanda comercial. "
            f"La hora pico es las **{fmt_hr(peak_hr)}** con ${float(peak_h['revenue']):,.0f} en ventas. "
            f"Se procesaron **{total_ord:,} pedidos** en total. "
            f"Utilice esta información para ajustar horarios de personal, campañas de email marketing "
            f"y estrategias de precios dinámicos según las horas de mayor actividad."
        ),
        "insights": {
            "total_orders": total_ord,
            "peak_hour": peak_hr,
            "peak_hour_orders": int(peak_h["orders"]) if peak_h is not None else 0,
            "peak_hour_revenue": float(peak_h["revenue"]) if peak_h is not None else 0,
            "hours_with_sales": int((df["orders"] > 0).sum()) if not df.empty else 0,
        },
    }

def _sales_by_category(from_date, to_date):
    f, t = _bounds(from_date, to_date)
    with _conn() as conn:
        df = pd.read_sql("""
            WITH ps AS (
                SELECT COALESCE((item->>'id')::int, 0) AS pid,
                    SUM((item->>'qty')::int) AS total_qty,
                    SUM((item->>'qty')::int * (item->>'price')::numeric) AS total_revenue
                FROM orders, LATERAL jsonb_array_elements(items) AS item
                WHERE created_at >= %s AND created_at <= (%s::date + interval '1 day')
                  AND (item->>'id') IS NOT NULL
                GROUP BY pid
            )
            SELECT COALESCE(p.category, 'Sin categoría') AS name,
                   SUM(ps.total_qty)::int AS count,
                   SUM(ps.total_revenue)::numeric AS revenue
            FROM ps LEFT JOIN products p ON p.id = ps.pid
            GROUP BY p.category ORDER BY revenue DESC
        """, conn, params=[f, t])
    chart = _dicts(df)
    total_rev = float(df["revenue"].sum()) if not df.empty else 0
    top_cat = df.iloc[0] if not df.empty else None
    top_name = top_cat["name"] if top_cat is not None else "—"
    top_pct = float(top_cat["revenue"]) / total_rev * 100 if top_cat is not None and total_rev > 0 else 0
    return {
        "data": chart,
        "analysis": (
            f"**Ventas por categoría de producto.** Este diagrama de pastel desglosa los ingresos totales "
            f"según la categoría de producto, mostrando qué segmentos generan mayor contribución económica. "
            f"La categoría líder es **{top_name}** con ${float(top_cat['revenue']):,.0f} "
            f"({top_pct:.1f}% del total de ${total_rev:,.0f}). "
            f"Este análisis ayuda a enfocar esfuerzos de inventario, marketing y desarrollo de productos "
            f"en las categorías de mayor rendimiento."
        ),
        "insights": {
            "total_revenue": round(total_rev, 2),
            "top_category": top_name,
            "top_category_revenue": float(top_cat["revenue"]) if top_cat is not None else 0,
            "top_category_pct": round(top_pct, 1),
            "category_count": len(chart),
        },
    }

def _month_over_month(from_date, to_date):
    f, t = _bounds(from_date, to_date)
    with _conn() as conn:
        df = pd.read_sql("""
            WITH monthly AS (
                SELECT DATE_TRUNC('month', created_at) AS month,
                       COUNT(*)::int AS orders,
                       COALESCE(SUM(total), 0)::numeric AS revenue
                FROM orders
                WHERE created_at >= %s AND created_at <= (%s::date + interval '1 day')
                GROUP BY month
            )
            SELECT TO_CHAR(month, 'YYYY-MM') AS label, month, orders, revenue,
                   LAG(orders) OVER (ORDER BY month) AS prev_orders,
                   LAG(revenue) OVER (ORDER BY month) AS prev_revenue,
                   CASE WHEN LAG(revenue) OVER (ORDER BY month) > 0
                     THEN ROUND((revenue - LAG(revenue) OVER (ORDER BY month)) / LAG(revenue) OVER (ORDER BY month) * 100, 1)
                     ELSE NULL END AS growth_pct
            FROM monthly ORDER BY month DESC
        """, conn, params=[f, t])
    chart = _dicts(df)
    if len(chart) < 2:
        return {"data": chart, "analysis": "**Comparativa mensual.** Se requieren al menos dos meses de datos para calcular la comparativa.", "insights": {}}
    last = chart[0]
    prev = chart[1]
    growth = last["growth_pct"]
    trend = "crecimiento" if growth is not None and growth > 0 else ("decrecimiento" if growth is not None and growth < 0 else "estabilidad")
    return {
        "data": chart,
        "analysis": (
            f"**Comparativa mensual (mes contra mes).** Este reporte compara el desempeño del último mes "
            f"frente al anterior, calculando la variación porcentual en ingresos y volumen de pedidos. "
            f"Se observa un **{trend}** del **{abs(growth):.1f}%** en ingresos "
            f"(último mes: ${float(last['revenue']):,.0f} vs. mes anterior: ${float(prev['revenue']):,.0f}). "
            f"Los pedidos pasaron de {int(prev['orders']):,} a {int(last['orders']):,}. "
            f"Este indicador permite evaluar la efectividad de estrategias comerciales y detectar "
            f"tendencias tempranas antes de que se consoliden."
        ),
        "insights": {
            "current_revenue": float(last["revenue"]),
            "previous_revenue": float(prev["revenue"]),
            "growth_pct": float(growth) if growth is not None else 0,
            "current_orders": int(last["orders"]),
            "previous_orders": int(prev["orders"]),
            "periods_compared": len(chart),
        },
    }

def _aov_trend(period, from_date, to_date):
    f, t = _bounds(from_date, to_date)
    period_map = {"daily": "DATE(created_at)", "weekly": "DATE_TRUNC('week', created_at)",
                  "monthly": "DATE_TRUNC('month', created_at)"}
    trunc = period_map.get(period, "DATE_TRUNC('month', created_at)")
    with _conn() as conn:
        df = pd.read_sql(f"""
            SELECT {trunc} AS date, COUNT(*)::int AS orders,
                   COALESCE(SUM(total), 0)::numeric AS revenue,
                   COALESCE(ROUND(AVG(total), 0), 0)::numeric AS avg_order_value
            FROM orders
            WHERE created_at >= %s AND created_at <= (%s::date + interval '1 day')
            GROUP BY date ORDER BY date ASC
        """, conn, params=[f, t])
    chart = _dicts(df)
    avg_aov = float(df["avg_order_value"].mean()) if not df.empty else 0
    min_aov = float(df["avg_order_value"].min()) if not df.empty else 0
    max_aov = float(df["avg_order_value"].max()) if not df.empty else 0
    return {
        "data": chart,
        "analysis": (
            f"**Evolución del ticket promedio (AOV).** Este gráfico de línea muestra cómo ha variado "
            f"el valor promedio de cada pedido a lo largo del tiempo. "
            f"El ticket promedio general es de **${avg_aov:,.0f}**, "
            f"con un mínimo de **${min_aov:,.0f}** y un máximo de **${max_aov:,.0f}**. "
            f"Monitorear el AOV ayuda a evaluar estrategias de upselling, ventas cruzadas y "
            f"paquetes promocionales. Un AOV creciente indica mayor valor percibido por el cliente."
        ),
        "insights": {
            "avg_aov": round(avg_aov, 2),
            "min_aov": round(min_aov, 2),
            "max_aov": round(max_aov, 2),
            "current_aov": float(chart[-1]["avg_order_value"]) if chart else 0,
        },
    }

def _discount_analysis(from_date, to_date):
    f, t = _bounds(from_date, to_date)
    with _conn() as conn:
        df = pd.read_sql("""
            SELECT COUNT(*)::int AS total_orders,
                   COUNT(*) FILTER (WHERE discount > 0 OR discount IS NOT NULL)::int AS discounted_orders,
                   COALESCE(SUM(COALESCE(discount, 0)), 0)::numeric AS total_discounts,
                   COALESCE(ROUND(AVG(COALESCE(discount, 0)), 0), 0)::numeric AS avg_discount,
                   CASE WHEN COUNT(*) > 0
                     THEN ROUND(COUNT(*) FILTER (WHERE discount > 0 OR discount IS NOT NULL)::numeric / COUNT(*) * 100, 1)
                     ELSE 0 END AS pct_discounted
            FROM orders
            WHERE created_at >= %s AND created_at <= (%s::date + interval '1 day')
        """, conn, params=[f, t])
    r = df.iloc[0] if not df.empty else None
    if r is None:
        return {"data": [], "analysis": "**Análisis de descuentos.** No hay datos disponibles.", "insights": {}}
    chart = [_dicts(df)[0]]
    return {
        "data": chart,
        "analysis": (
            f"**Análisis de descuentos aplicados.** Este reporte cuantifica el impacto de los descuentos "
            f"en las ventas totales. De **{int(r['total_orders']):,} pedidos**, "
            f"**{int(r['discounted_orders']):,}** ({float(r['pct_discounted']):.1f}%) incluyeron descuento. "
            f"El descuento total otorgado asciende a **${float(r['total_discounts']):,.0f}**, "
            f"con un descuento promedio de **${float(r['avg_discount']):,.0f}** por pedido. "
            f"Evalúe si el volumen adicional generado por los descuentos compensa la reducción en el margen."
        ),
        "insights": {
            "total_orders": int(r["total_orders"]),
            "discounted_orders": int(r["discounted_orders"]),
            "total_discounts": float(r["total_discounts"]),
            "avg_discount": float(r["avg_discount"]),
            "pct_discounted": float(r["pct_discounted"]),
        },
    }

def _order_value_dist():
    with _conn() as conn:
        df = pd.read_sql("""
            SELECT CASE
                     WHEN total < 50000 THEN '< $50K'
                     WHEN total < 100000 THEN '$50K - $100K'
                     WHEN total < 200000 THEN '$100K - $200K'
                     WHEN total < 500000 THEN '$200K - $500K'
                     ELSE '$500K+'
                   END AS range,
                   COUNT(*)::int AS count,
                   COALESCE(SUM(total), 0)::numeric AS revenue
            FROM orders GROUP BY range ORDER BY MIN(total)
        """, conn)
    chart = _dicts(df)
    total_ord = int(df["count"].sum()) if not df.empty else 0
    top_range = df.iloc[0] if not df.empty else None
    top_name = top_range["range"] if top_range is not None else "—"
    return {
        "data": chart,
        "analysis": (
            f"**Distribución de pedidos por valor total.** Este diagrama de pastel clasifica los pedidos "
            f"según su monto total, agrupándolos en rangos predefinidos. "
            f"El rango más frecuente es **{top_name}** con {int(top_range['count']):,} pedidos. "
            f"De **{total_ord:,} pedidos** analizados, esta distribución ayuda a entender "
            f"el perfil de compra de los clientes: si predominan pedidos pequeños, medios o de alto valor, "
            f"lo que orienta estrategias de precios y segmentación."
        ),
        "insights": {
            "total_orders": total_ord,
            "most_frequent_range": top_name,
            "most_frequent_count": int(top_range["count"]) if top_range is not None else 0,
            "ranges_count": len(chart),
        },
    }

# ── Product Analysis ────────────────────────────────────

def _top_products(from_date, to_date, limit):
    f, t = _bounds(from_date, to_date)
    with _conn() as conn:
        df = pd.read_sql("""
            SELECT item->>'name' AS name,
                   SUM((item->>'qty')::int)::int AS total_qty,
                   SUM((item->>'qty')::int * (item->>'price')::numeric)::numeric AS total_revenue
            FROM orders, LATERAL jsonb_array_elements(items) AS item
            WHERE created_at >= %s AND created_at <= (%s::date + interval '1 day')
            GROUP BY item->>'name'
            ORDER BY total_revenue DESC LIMIT %s
        """, conn, params=[f, t, limit])
    chart = _dicts(df)
    total_rev = float(df["total_revenue"].sum()) if not df.empty else 0
    top = df.iloc[0] if not df.empty else None
    top_name = top["name"] if top is not None else "—"
    top_rev = float(top["total_revenue"]) if top is not None else 0
    top_pct = top_rev / total_rev * 100 if total_rev > 0 else 0
    top_qty = int(top["total_qty"]) if top is not None else 0
    return {
        "data": chart,
        "analysis": (
            f"**Productos más vendidos.** Ranking de los {limit} productos con mayores ingresos generados. "
            f"El producto líder es **{top_name}** con {top_qty:,} unidades vendidas "
            f"y **${top_rev:,.0f}** en ingresos ({top_pct:.1f}% del total de ${total_rev:,.0f}). "
            f"Este ranking permite identificar los artículos estrella, optimizar el inventario "
            f"y enfocar estrategias promocionales en los productos de mayor rendimiento."
        ),
        "insights": {
            "total_revenue": round(total_rev, 2),
            "top_product": top_name,
            "top_product_qty": top_qty,
            "top_product_revenue": round(top_rev, 2),
            "top_product_pct": round(top_pct, 1),
            "products_count": len(chart),
        },
    }

def _product_categories():
    with _conn() as conn:
        df = pd.read_sql("""
            SELECT COALESCE(category, 'Sin categoría') AS name,
                   COUNT(*)::int AS count
            FROM products WHERE active = true
            GROUP BY category ORDER BY count DESC
        """, conn)
    chart = _dicts(df)
    total_products = int(df["count"].sum()) if not df.empty else 0
    top_cat = df.iloc[0] if not df.empty else None
    return {
        "data": chart,
        "analysis": (
            f"**Cantidad de productos por categoría.** Este diagrama de pastel muestra la distribución "
            f"del catálogo de productos según su categoría, indicando qué segmentos tienen mayor variedad. "
            f"De **{total_products:,} productos activos**, la categoría **{top_cat['name'] if top_cat is not None else '—'}** "
            f"es la más numerosa con {int(top_cat['count']):,} productos. "
            f"Utilice esta información para balancear el inventario y detectar categorías "
            f"con poca representación que podrían ampliarse."
        ),
        "insights": {
            "total_products": total_products,
            "top_category": top_cat["name"] if top_cat is not None else "—",
            "top_category_count": int(top_cat["count"]) if top_cat is not None else 0,
            "category_count": len(chart),
        },
    }

def _price_distribution():
    with _conn() as conn:
        df = pd.read_sql("""
            SELECT CASE
                     WHEN price < 10000 THEN '< $10K'
                     WHEN price < 30000 THEN '$10K - $30K'
                     WHEN price < 50000 THEN '$30K - $50K'
                     WHEN price < 100000 THEN '$50K - $100K'
                     ELSE '$100K+'
                   END AS range,
                   COUNT(*)::int AS count
            FROM products WHERE active = true
            GROUP BY range ORDER BY MIN(price)
        """, conn)
    chart = _dicts(df)
    total = int(df["count"].sum()) if not df.empty else 0
    top_r = df.iloc[0] if not df.empty else None
    return {
        "data": chart,
        "analysis": (
            f"**Distribución de precios de productos.** Este gráfico clasifica los productos activos "
            f"según su rango de precio, mostrando la concentración en cada segmento. "
            f"De **{total:,} productos**, el rango **{top_r['range'] if top_r is not None else '—'}** "
            f"contiene la mayor cantidad con {int(top_r['count']):,} productos. "
            f"Este análisis ayuda a entender la estrategia de precios del catálogo e identificar "
            f"si existe una concentración excesiva en un segmento específico."
        ),
        "insights": {
            "total_products": total,
            "top_range": top_r["range"] if top_r is not None else "—",
            "top_range_count": int(top_r["count"]) if top_r is not None else 0,
            "range_count": len(chart),
        },
    }

# ── Orders Analysis ─────────────────────────────────────

def _orders_by_status(from_date, to_date):
    f, t = _bounds(from_date, to_date)
    with _conn() as conn:
        df = pd.read_sql("""
            SELECT status, COUNT(*)::int AS count, COALESCE(SUM(total), 0)::numeric AS revenue
            FROM orders
            WHERE created_at >= %s AND created_at <= (%s::date + interval '1 day')
            GROUP BY status ORDER BY count DESC
        """, conn, params=[f, t])
    chart = _dicts(df)
    total = int(df["count"].sum()) if not df.empty else 0
    status_map = {"pending": "pendientes", "confirmed": "confirmados", "shipped": "enviados",
                  "delivered": "entregados", "cancelled": "cancelados"}
    status_rows = []
    for _, r in df.iterrows():
        status_rows.append(f"**{status_map.get(str(r['status']), str(r['status']))}**: {int(r['count']):,}")
    status_summary = " | ".join(status_rows)
    delivered = int(df[df["status"] == "delivered"]["count"].sum()) if not df.empty else 0
    delivered_pct = delivered / total * 100 if total > 0 else 0
    cancelled = int(df[df["status"] == "cancelled"]["count"].sum()) if not df.empty else 0
    return {
        "data": chart,
        "analysis": (
            f"**Pedidos por estado.** Este diagrama de pastel desglosa el total de pedidos según su estado "
            f"actual en el flujo de trabajo. De **{total:,} pedidos** en el período: {status_summary}. "
            f"La tasa de entrega es del **{delivered_pct:.1f}%** ({delivered:,} entregados) "
            f"y **{cancelled:,} pedidos fueron cancelados**. "
            f"Monitoree los pedidos pendientes para asegurar una atención oportuna y reduzca "
            f"la tasa de cancelación mejorando los tiempos de respuesta."
        ),
        "insights": {
            "total_orders": total,
            "delivered": delivered,
            "delivered_pct": round(delivered_pct, 1),
            "cancelled": cancelled,
            "pending": int(df[df["status"] == "pending"]["count"].sum()) if not df.empty else 0,
        },
    }

# ── Customer Analysis ──────────────────────────────────

def _customer_new(from_date, to_date):
    f, t = _bounds(from_date, to_date)
    with _conn() as conn:
        total = pd.read_sql("SELECT COUNT(*)::int AS count FROM customers", conn)
        new = pd.read_sql("""
            SELECT DATE(created_at) AS date, COUNT(*)::int AS count
            FROM customers
            WHERE created_at >= %s AND created_at <= (%s::date + interval '1 day')
            GROUP BY DATE(created_at) ORDER BY date ASC
        """, conn, params=[f, t])
    total_c = int(total["count"].iloc[0]) if not total.empty else 0
    chart = _dicts(new)
    new_total = int(new["count"].sum()) if not new.empty else 0
    return {
        "data": chart,
        "analysis": (
            f"**Clientes nuevos.** Este reporte muestra la cantidad de nuevos clientes registrados "
            f"en el período seleccionado, indicando la capacidad de atracción de la tienda. "
            f"Se registraron **{new_total:,} nuevos clientes** en este período, "
            f"de un total histórico de **{total_c:,} clientes**. "
            f"Compare este dato con períodos anteriores para evaluar campañas de adquisición "
            f"y estrategias de captación de nuevos compradores."
        ),
        "insights": {
            "total_customers_ever": total_c,
            "new_customers": new_total,
            "avg_per_day": round(new_total / max(len(chart), 1), 1),
            "days_with_registrations": len(chart),
        },
    }

def _top_customers(limit):
    with _conn() as conn:
        df = pd.read_sql("""
            SELECT c.id, c.name, c.email, c.phone, c.city,
                   c.total_orders::int AS total_orders,
                   c.total_spent::numeric AS total_spent,
                   c.last_order_date
            FROM customers c
            ORDER BY c.total_spent DESC NULLS LAST LIMIT %s
        """, conn, params=[limit])
    chart = _dicts(df)
    top = df.iloc[0] if not df.empty else None
    top_name = top["name"] or top["email"] if top is not None else "—"
    return {
        "data": chart,
        "analysis": (
            f"**Top {limit} clientes por gasto total.** Ranking de los clientes que más han gastado "
            f"en la tienda, ordenados por su contribución económica total. "
            f"El cliente principal es **{top_name}** con ${float(top['total_spent']):,.0f} gastados "
            f"en {int(top['total_orders']):,} pedidos. "
            f"Identifique a sus mejores clientes para programas de fidelización, beneficios exclusivos "
            f"y estrategias de retención personalizadas."
        ),
        "insights": {
            "top_customer_name": top_name,
            "top_customer_spent": float(top["total_spent"]) if top is not None else 0,
            "top_customer_orders": int(top["total_orders"]) if top is not None else 0,
            "customers_count": len(chart),
        },
    }

def _repeat_purchase():
    with _conn() as conn:
        df = pd.read_sql("""
            WITH customer_orders AS (
                SELECT COALESCE(email, '') AS email_clean, COUNT(*)::int AS order_count
                FROM orders GROUP BY email_clean
            )
            SELECT COUNT(*)::int AS total_customers,
                   COUNT(*) FILTER (WHERE order_count >= 2)::int AS repeat_customers,
                   COUNT(*) FILTER (WHERE order_count = 1)::int AS one_time_customers,
                   CASE WHEN COUNT(*) > 0
                     THEN ROUND(COUNT(*) FILTER (WHERE order_count >= 2)::numeric / COUNT(*) * 100, 1)
                     ELSE 0 END AS repeat_rate
            FROM customer_orders WHERE email_clean != ''
        """, conn)
    r = df.iloc[0] if not df.empty else None
    if r is None:
        return {"data": [], "analysis": "**Tasa de recompra.** No hay datos disponibles.", "insights": {}}
    chart = [_dicts(df)[0]]
    return {
        "data": chart,
        "analysis": (
            f"**Tasa de recompra.** Este indicador mide el porcentaje de clientes que han realizado "
            f"más de una compra, reflejando la lealtad y satisfacción del cliente. "
            f"De **{int(r['total_customers']):,} clientes** que han comprado, "
            f"**{int(r['repeat_customers']):,}** ({float(r['repeat_rate']):.1f}%) son recurrentes "
            f"y **{int(r['one_time_customers']):,}** compraron solo una vez. "
            f"Una tasa de recompra saludable indica una base de clientes leales; "
            f"si es baja, considere programas de fidelización o mejoras en la experiencia post-venta."
        ),
        "insights": {
            "total_customers": int(r["total_customers"]),
            "repeat_customers": int(r["repeat_customers"]),
            "one_time_customers": int(r["one_time_customers"]),
            "repeat_rate": float(r["repeat_rate"]),
        },
    }

def _customers_by_city():
    with _conn() as conn:
        df = pd.read_sql("""
            SELECT COALESCE(NULLIF(city, ''), 'Sin ciudad') AS name,
                   COUNT(*)::int AS count,
                   COALESCE(SUM(total_spent), 0)::numeric AS revenue
            FROM customers GROUP BY city ORDER BY count DESC
        """, conn)
    chart = _dicts(df)
    total = int(df["count"].sum()) if not df.empty else 0
    top = df.iloc[0] if not df.empty else None
    return {
        "data": chart,
        "analysis": (
            f"**Clientes por ciudad.** Este diagrama de pastel muestra la distribución geográfica "
            f"de los clientes según su ciudad de registro. "
            f"De **{total:,} clientes**, la ciudad con mayor concentración es "
            f"**{top['name'] if top is not None else '—'}** con {int(top['count']):,} clientes. "
            f"Este análisis ayuda a enfocar campañas publicitarias regionales, optimizar rutas "
            f"de entrega y detectar oportunidades de expansión en nuevas zonas geográficas."
        ),
        "insights": {
            "total_customers": total,
            "top_city": top["name"] if top is not None else "—",
            "top_city_count": int(top["count"]) if top is not None else 0,
            "cities_count": len(chart),
        },
    }

# ── Inventory Analysis ─────────────────────────────────

def _inventory_summary():
    with _conn() as conn:
        cats = pd.read_sql("""
            SELECT COALESCE(p.category, 'Sin categoría') AS category,
                   COUNT(p.id)::int AS products,
                   COALESCE(SUM(i.quantity), 0)::int AS total_stock,
                   COALESCE(SUM(p.price * i.quantity), 0)::numeric AS stock_value
            FROM products p
            LEFT JOIN inventory i ON i.product_id = p.id
            WHERE p.active = true
            GROUP BY p.category ORDER BY stock_value DESC
        """, conn)
        sv = pd.read_sql("""
            SELECT COALESCE(SUM(p.price * i.quantity), 0)::numeric AS total_value,
                   COALESCE(SUM(i.quantity), 0)::int AS total_items,
                   COUNT(p.id) FILTER (WHERE i.quantity > 0)::int AS products_with_stock,
                   COUNT(p.id) FILTER (WHERE i.quantity IS NULL OR i.quantity = 0)::int AS out_of_stock
            FROM products p
            LEFT JOIN inventory i ON i.product_id = p.id
            WHERE p.active = true
        """, conn)
        low = pd.read_sql("""
            SELECT COUNT(*)::int AS count
            FROM inventory i JOIN products p ON p.id = i.product_id
            WHERE i.quantity <= i.min_stock
        """, conn)
    chart = _dicts(cats)
    s = sv.iloc[0] if not sv.empty else None
    lc = int(low["count"].iloc[0]) if not low.empty else 0
    tval = float(s["total_value"]) if s is not None else 0
    titems = int(s["total_items"]) if s is not None else 0
    pws = int(s["products_with_stock"]) if s is not None else 0
    oos = int(s["out_of_stock"]) if s is not None else 0
    top_cat = cats.iloc[0] if not cats.empty else None
    top_cat_name = top_cat["category"] if top_cat is not None else "—"
    return {
        "data": chart,
        "analysis": (
            f"**Resumen de inventario por categoría.** Este reporte muestra el valor del inventario "
            f"desglosado por categoría de producto. El valor total del inventario es de "
            f"**${tval:,.0f}** distribuido en **{titems:,} unidades** y **{pws:,} productos con stock**. "
            f"**{oos:,} productos** están sin stock y **{lc:,}** tienen stock bajo. "
            f"La categoría con mayor valor es **{top_cat_name}** (${float(top_cat['stock_value']):,.0f}). "
            f"Mantenga un control riguroso del inventario para evitar roturas de stock "
            f"y optimizar la rotación de productos."
        ),
        "insights": {
            "total_value": round(tval, 2),
            "total_items": titems,
            "products_with_stock": pws,
            "out_of_stock": oos,
            "low_stock": lc,
            "top_category": top_cat_name,
            "category_count": len(chart),
        },
    }

def _inventory_value(limit):
    with _conn() as conn:
        df = pd.read_sql("""
            SELECT p.id, p.name, p.category, p.price,
                   COALESCE(i.quantity, 0)::int AS stock,
                   COALESCE(p.price * i.quantity, 0)::numeric AS stock_value
            FROM products p
            LEFT JOIN inventory i ON i.product_id = p.id
            WHERE p.active = true
            ORDER BY stock_value DESC LIMIT %s
        """, conn, params=[limit])
    chart = _dicts(df)
    total = float(df["stock_value"].sum()) if not df.empty else 0
    top = df.iloc[0] if not df.empty else None
    top_name = top["name"] if top is not None else "—"
    return {
        "data": chart,
        "analysis": (
            f"**Valor de inventario por producto.** Ranking de los {limit} productos con mayor valor "
            f"en inventario (precio × cantidad en stock). "
            f"El producto con mayor valor es **{top_name}** con ${float(top['stock_value']):,.0f} "
            f"({int(top['stock']):,} unidades × ${float(top['price']):,.0f}). "
            f"El valor total de estos {limit} productos es **${total:,.0f}**. "
            f"Identifique los productos que concentran mayor capital para optimizar "
            f"las decisiones de reabastecimiento y rotación de inventario."
        ),
        "insights": {
            "total_value_top": round(total, 2),
            "top_product": top_name,
            "top_product_value": float(top["stock_value"]) if top is not None else 0,
            "top_product_stock": int(top["stock"]) if top is not None else 0,
            "products_count": len(chart),
        },
    }

# ── Router ──────────────────────────────────────────────

ANALYSIS_MAP = {
    "salesDaily": lambda p, f, t, l: _sales_analysis("daily", f, t),
    "salesWeekly": lambda p, f, t, l: _sales_analysis("weekly", f, t),
    "salesMonthly": lambda p, f, t, l: _sales_analysis("monthly", f, t),
    "salesAnnual": lambda p, f, t, l: _sales_analysis("annual", f, t),
    "salesByDayOfWeek": lambda p, f, t, l: _sales_day_of_week(f, t),
    "salesByHour": lambda p, f, t, l: _sales_by_hour(f, t),
    "salesByCategory": lambda p, f, t, l: _sales_by_category(f, t),
    "monthOverMonth": lambda p, f, t, l: _month_over_month(f, t),
    "aovTrend": lambda p, f, t, l: _aov_trend(p or "monthly", f, t),
    "discountAnalysis": lambda p, f, t, l: _discount_analysis(f, t),
    "orderValueDist": lambda p, f, t, l: _order_value_dist(),
    "topProducts": lambda p, f, t, l: _top_products(f, t, l or 10),
    "productCategories": lambda p, f, t, l: _product_categories(),
    "priceDistribution": lambda p, f, t, l: _price_distribution(),
    "ordersByStatus": lambda p, f, t, l: _orders_by_status(f, t),
    "customerNew": lambda p, f, t, l: _customer_new(f, t),
    "topCustomers": lambda p, f, t, l: _top_customers(l or 10),
    "repeatPurchase": lambda p, f, t, l: _repeat_purchase(),
    "customersByCity": lambda p, f, t, l: _customers_by_city(),
    "inventorySummary": lambda p, f, t, l: _inventory_summary(),
    "inventoryValue": lambda p, f, t, l: _inventory_value(l or 10),
}

def analyze(report_type, period="monthly", from_date=None, to_date=None, limit=10):
    fn = ANALYSIS_MAP.get(report_type)
    if fn is None:
        return {"error": f"Tipo de reporte desconocido: {report_type}"}
    try:
        return fn(period, from_date, to_date, limit)
    except Exception as e:
        return {"error": str(e), "data": [], "analysis": f"**Error al analizar:** {e}", "insights": {}}
