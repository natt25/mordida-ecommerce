import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { DollarSign, ShoppingCart, Users, TrendingUp } from 'lucide-react';

const API_URL = 'http://localhost:4000/api';

export default function Dashboard() {
  const [resumen, setResumen] = useState(null);
  const [productosMasVendidos, setProductosMasVendidos] = useState([]);
  const [estadoPedidos, setEstadoPedidos] = useState([]);
  const [ventasPorDia, setVentasPorDia] = useState([]);
  const [ventasPorCategoria, setVentasPorCategoria] = useState([]);
  const [cupones, setCupones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setError(null);
        setLoading(true);

        const endpoints = [
          'resumen',
          'productos-vendidos',
          'estado-pedidos',
          'ventas-por-dia',
          'ventas-por-categoria',
          'cupones-performance'
        ];

        const respuestas = await Promise.all(
          endpoints.map(ep => fetch(`${API_URL}/dashboard/${ep}`)
            .catch(e => {
              console.error(`Error en ${ep}:`, e);
              return null;
            }))
        );

        const datos = await Promise.all(
          respuestas.map(res => res ? res.json().catch(() => null) : null)
        );

        setResumen(datos[0] || null);
        setProductosMasVendidos(Array.isArray(datos[1]) ? datos[1] : []);
        setEstadoPedidos(Array.isArray(datos[2]) ? datos[2] : []);
        setVentasPorDia(Array.isArray(datos[3]) ? datos[3] : []);
        setVentasPorCategoria(Array.isArray(datos[4]) ? datos[4] : []);
        setCupones(Array.isArray(datos[5]) ? datos[5] : []);
      } catch (err) {
        console.error('Error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
    const intervalo = setInterval(cargarDatos, 60000);
    return () => clearInterval(intervalo);
  }, []);

  if (loading) {
    return (
      <div className="dashboard-container">
        <p style={{ textAlign: 'center', padding: '40px' }}>Cargando dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <p style={{ textAlign: 'center', padding: '40px', color: 'red' }}>
          Error: {error}
        </p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <h1>Dashboard de Ventas</h1>

      {resumen && (
        <div className="dashboard-summary">
          <div className="summary-card">
            <div className="summary-icon" style={{ backgroundColor: '#3b82f6' }}>
              <DollarSign size={28} />
            </div>
            <div className="summary-content">
              <p className="summary-label">Total de Ventas</p>
              <p className="summary-value">S/. {Number(resumen.total_ventas || 0).toFixed(2)}</p>
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-icon" style={{ backgroundColor: '#10b981' }}>
              <ShoppingCart size={28} />
            </div>
            <div className="summary-content">
              <p className="summary-label">Total de Pedidos</p>
              <p className="summary-value">{resumen.total_pedidos}</p>
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-icon" style={{ backgroundColor: '#f59e0b' }}>
              <Users size={28} />
            </div>
            <div className="summary-content">
              <p className="summary-label">Clientes Unicos</p>
              <p className="summary-value">{resumen.total_clientes}</p>
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-icon" style={{ backgroundColor: '#8b5cf6' }}>
              <TrendingUp size={28} />
            </div>
            <div className="summary-content">
              <p className="summary-label">Ticket Promedio</p>
              <p className="summary-value">S/. {Number(resumen.ticket_promedio || 0).toFixed(2)}</p>
            </div>
          </div>
        </div>
      )}

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h2>Ventas Ultimos 30 Dias</h2>
          {ventasPorDia && ventasPorDia.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={[...ventasPorDia].reverse()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="fecha" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="total_ventas" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p>No hay datos disponibles</p>
          )}
        </div>

        <div className="dashboard-card">
          <h2>Estado de Pedidos</h2>
          {estadoPedidos && estadoPedidos.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={estadoPedidos}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="cantidad"
                >
                  {estadoPedidos.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p>No hay datos disponibles</p>
          )}
        </div>

        <div className="dashboard-card">
          <h2>Top 10 Productos Vendidos</h2>
          {productosMasVendidos && productosMasVendidos.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={productosMasVendidos}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="nombre" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="cantidad_vendida" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p>No hay datos disponibles</p>
          )}
        </div>

        <div className="dashboard-card">
          <h2>Ventas por Categoria</h2>
          {ventasPorCategoria && ventasPorCategoria.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={ventasPorCategoria} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="categoria" type="category" width={120} />
                <Tooltip />
                <Bar dataKey="ingresos" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p>No hay datos disponibles</p>
          )}
        </div>

        <div className="dashboard-card">
          <h2>Performance de Cupones</h2>
          {cupones && cupones.length > 0 ? (
            <div className="dashboard-table">
              <table>
                <thead>
                  <tr>
                    <th>Codigo</th>
                    <th>Usados</th>
                    <th>Ingresos</th>
                    <th>Ticket Promedio</th>
                  </tr>
                </thead>
                <tbody>
                  {cupones.map((cupon) => (
                    <tr key={cupon.codigo}>
                      <td>
                        <strong>{cupon.codigo}</strong>
                      </td>
                      <td>{cupon.cantidad_usados}</td>
                      <td>S/. {Number(cupon.ingresos || 0).toFixed(2)}</td>
                      <td>S/. {Number(cupon.ticket_promedio || 0).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>No hay cupones usados</p>
          )}
        </div>

        {resumen && (
          <div className="dashboard-card">
            <h2>Estadisticas Adicionales</h2>
            <div className="stats-grid">
              <div className="stat-item">
                <p className="stat-label">Pedidos Entregados</p>
                <p className="stat-value">{resumen.pedidos_entregados}</p>
              </div>
              <div className="stat-item">
                <p className="stat-label">Pedidos Cancelados</p>
                <p className="stat-value" style={{ color: '#ef4444' }}>{resumen.pedidos_cancelados}</p>
              </div>
              <div className="stat-item">
                <p className="stat-label">Tasa de Exito</p>
                <p className="stat-value">
                  {resumen.total_pedidos > 0 ? ((resumen.pedidos_entregados / resumen.total_pedidos) * 100).toFixed(1) : 0}%
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
