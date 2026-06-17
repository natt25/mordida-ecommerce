import fetch from 'node-fetch';
import { env } from '../config/env.js';
import { construirContextoMordida, buscarProductosPorNombre } from '../utils/chatbotUtils.js';

export const clienteChat = async (req, res) => {
  try {
    const pregunta = req.body?.mensaje || '';
    
    if (!pregunta.trim()) {
      return res.status(400).json({ error: 'El mensaje no puede estar vacío' });
    }

    // Obtener contexto de la BD
    const contextoMordida = await construirContextoMordida();
    
    // Buscar si el usuario pregunta por un producto específico
    let productosPertinentes = [];
    const palabrasClave = pregunta.toLowerCase().split(' ');
    if (palabrasClave.length > 1) {
      const termino = palabrasClave.slice(0, 3).join(' ');
      productosPertinentes = await buscarProductosPorNombre(termino);
    }

    const systemPrompt = `Eres el asistente virtual de Mordida, una aplicación de comida rápida. Tu nombre es "Asistente Mordida".

Tu objetivo es:
- Ayudar a los clientes con consultas sobre productos y pedidos
- Recomendar combos y platos basándote en las preferencias y disponibilidad
- Responder preguntas sobre promociones, ofertas y cupones activos
- Asistir con dudas sobre el proceso de entrega, métodos de pago
- Ser amable, rápido y útil en español

INSTRUCCIONES IMPORTANTES:
- SIEMPRE usa información REAL de los productos disponibles listados abajo
- Si un cliente pregunta por un producto específico, solo menciona los que están en la lista
- Cuando recomiendes productos, incluye el precio en soles (S/.)
- Si preguntan sobre cupones, ofrece los códigos ACTIVOS disponibles
- Responde de manera natural y conversacional, pero precisa
- Limita tus respuestas a 2-3 oraciones cuando sea posible
- Si algo no está en la información disponible, sé honesto y di que no tienes esa información

${contextoMordida}
${productosPertinentes.length > 0 ? `\nPRODUCTOS RELACIONADOS CON LA CONSULTA:\n${productosPertinentes.map(p => `- ${p.nombre}: S/. ${p.precio}`).join('\n')}` : ''}
`;

    const response = await fetch(`${env.ollamaUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: env.ollamaModel,
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: pregunta
          }
        ],
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama error: ${response.status}`);
    }

    const data = await response.json();
    const respuesta = data.message.content;

    res.json({
      provider: 'ollama',
      model: env.ollamaModel,
      respuesta
    });
  } catch (error) {
    console.error('Error en clienteChat:', error);
    res.status(500).json({ 
      error: 'Error al procesar tu pregunta',
      detalles: error.message 
    });
  }
};

export const adminVentasChat = async (req, res) => {
  try {
    const pregunta = req.body?.mensaje || 'Dame un resumen de las ventas de hoy';

    const contextoMordida = await construirContextoMordida();

    const systemPrompt = `Eres un asistente de análisis de ventas para Mordida e-commerce.

Tu rol es:
- Analizar tendencias de ventas basándote en el catálogo disponible
- Proporcionar insights sobre productos populares y su demanda
- Sugerir estrategias de marketing y promociones
- Reportar sobre conversión de cupones
- Identificar oportunidades de mejora

INFORMACIÓN DEL SISTEMA:
${contextoMordida}

Responde en español con análisis estructurados y recomendaciones accionables basadas en los productos y promociones disponibles.`;

    const response = await fetch(`${env.ollamaUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: env.ollamaModel,
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: pregunta
          }
        ],
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama error: ${response.status}`);
    }

    const data = await response.json();
    const respuesta = data.message.content;

    res.json({
      provider: 'ollama',
      model: env.ollamaModel,
      respuesta
    });
  } catch (error) {
    console.error('Error en adminVentasChat:', error);
    res.status(500).json({ 
      error: 'Error al procesar la consulta',
      detalles: error.message 
    });
  }
};
