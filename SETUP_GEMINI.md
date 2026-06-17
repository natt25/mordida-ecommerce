# 🤖 Guía de Integración: Asistente Mordida con Google Gemini

## ✅ Lo que ya se ha hecho:

1. ✔️ Instalado el SDK de Google Generative AI
2. ✔️ Actualizado `env.js` para incluir la variable `GEMINI_API_KEY`
3. ✔️ Implementado los controladores del chatbot con Google Gemini
4. ✔️ Actualizado el ChatWidget frontend para comunicarse con la API
5. ✔️ Actualizado `.env.example` con la nueva variable

## 🔧 Pasos para activar el chatbot:

### Paso 1: Obtener la clave API de Google Gemini

1. Abre [Google AI Studio](https://aistudio.google.com)
2. Haz clic en **"Get API key"** (esquina superior izquierda)
3. Selecciona **"Create new secret key in Google Cloud"**
4. Copia la clave que aparece
5. Guarda esta clave en un lugar seguro

### Paso 2: Configurar la variable de entorno

1. Si no existe el archivo `.env` en la carpeta `backend/`, copia el contenido de `.env.example`:
   ```bash
   cp .env.example .env
   ```

2. Abre el archivo `.env` en el editor y reemplaza:
   ```
   GEMINI_API_KEY=tu_clave_gemini_aqui
   ```
   Con tu clave real de Google Gemini.

### Paso 3: Reiniciar el servidor backend

```bash
cd backend
npm run dev
```

### Paso 4: Probar el chatbot

1. Abre el frontend: `http://localhost:5173`
2. Haz clic en el ícono del chat (burbuja en la esquina inferior derecha)
3. Escribe un mensaje como: "¿Qué combos tienen disponibles?"

## 🎯 Funcionalidades implementadas:

### Para Clientes:
- **Recomendaciones de productos**: El bot puede sugerir combos y platos
- **Información de pedidos**: Consulta sobre estado de órdenes
- **Promociones**: Información sobre cupones y ofertas
- **Dudas generales**: Preguntas sobre envíos, métodos de pago, etc.

### Para Administradores:
- **Análisis de ventas**: Trends de productos populares
- **Insights de marketing**: Recomendaciones basadas en datos
- **Análisis de cupones**: Conversión y efectividad
- **Reportes de horarios**: Patrones de compra por hora/día

## 📝 Endpoints disponibles:

- `POST /api/chatbot/cliente` - Chat para clientes
- `POST /api/chatbot/admin/ventas` - Chat para análisis de ventas (admin)

Estructura del request:
```json
{
  "mensaje": "Tu pregunta aquí"
}
```

## 🐛 Solución de problemas:

**Error: "GEMINI_API_KEY no configurada"**
- Verifica que la clave esté en el archivo `.env`
- Reinicia el servidor backend con `npm run dev`

**Error: "Error al conectar con el servidor"**
- Asegúrate que el backend está corriendo en `http://localhost:4000`
- Verifica que CORS esté habilitado para `http://localhost:5173`

**El chatbot no responde:**
- Revisa la consola del backend para mensajes de error
- Asegúrate que la clave API de Google Gemini es válida
- Verifica que tienes cuota disponible en Google AI Studio

## 📚 Recursos útiles:

- [Google AI Studio](https://aistudio.google.com)
- [Documentación de Google Generative AI](https://ai.google.dev/tutorials/python_quickstart)
- [SDK Node.js](https://github.com/google/generative-ai-js)

¡Listo! Tu Asistente Mordida con Google Gemini está configurado y listo para usar. 🚀
