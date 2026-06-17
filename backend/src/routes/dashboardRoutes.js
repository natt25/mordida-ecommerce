import { Router } from 'express';
import {
  obtenerResumenVentas,
  obtenerProductosMasVendidos,
  obtenerEstadoPedidos,
  obtenerVentasPorDia,
  obtenerVentasPorCategoria,
  obtenerCuponesPerformance
} from '../controllers/dashboardController.js';

const router = Router();

router.get('/resumen', obtenerResumenVentas);
router.get('/productos-vendidos', obtenerProductosMasVendidos);
router.get('/estado-pedidos', obtenerEstadoPedidos);
router.get('/ventas-por-dia', obtenerVentasPorDia);
router.get('/ventas-por-categoria', obtenerVentasPorCategoria);
router.get('/cupones-performance', obtenerCuponesPerformance);

export default router;
