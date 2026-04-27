const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());

app.use(express.json({
  limit: '20mb'
}));

app.use(express.static('public'));

const PORT = 3000;

/*
==================================================
COLE A URL DO COLAB AQUI
==================================================
*/

const API_URL =
'https://COLE_AQUI.pinggy-free.link/generate';


/*
==================================================
SYSTEM AGENT
==================================================
*/

const AGENT = `
Você é RoomRush AI.

Especialista em:

- JavaScript
- Phaser 3
- game engines
- Node.js
- multiplayer
- backend
- frontend
- ECS
- shaders

Responda em português.

Sempre gere código limpo.
`;


/*
==================================================
BUILD PROMPT
==================================================
*/

function buildPrompt(messages) {

  let history = '';

  for (const msg of messages) {

    if (msg.role === 'user') {

      history += `
Usuário:
${msg.content}
`;

    }

    if (msg.role === 'assistant') {

      history += `
Assistente:
${msg.content}
`;

    }

  }

  return `
${AGENT}

${history}

Assistente:
`;

}


/*
==================================================
CHAT API
==================================================
*/

app.post('/api/chat', async (req, res) => {

  res.writeHead(200, {

    'Content-Type': 'text/event-stream',

    'Cache-Control': 'no-cache',

    'Connection': 'keep-alive'

  });

  try {

    const messages =
      req.body.messages || [];

    const prompt =
      buildPrompt(messages);

    console.log('📨 Enviando prompt...');

    const response = await fetch(

      API_URL,

      {

        method: 'POST',

        headers: {

          'Content-Type':
          'application/json'

        },

        body: JSON.stringify({

          prompt

        })

      }

    );

    if (!response.ok) {

      throw new Error(
        `Erro API ${response.status}`
      );

    }

    const data =
      await response.json();

    let text =
      data.response || '';

    /*
    ==========================================
    LIMPEZA
    ==========================================
    */

    text = text

      .replace(prompt, '')

      .replace(/Usuário:/gi, '')

      .replace(/Assistente:/gi, '')

      .trim();


    /*
    ==========================================
    STREAM FAKE
    ==========================================
    */

    const chunks =
      text.split(' ');

    for (const chunk of chunks) {

      res.write(

        `data: ${JSON.stringify({

          content:
          chunk + ' '

        })}\n\n`

      );

      await new Promise(r =>
        setTimeout(r, 10)
      );

    }

    res.write(

      `data: ${JSON.stringify({

        done: true

      })}\n\n`

    );

    res.end();

    console.log('✅ Resposta enviada');

  }

  catch (err) {

    console.error(err);

    res.write(

      `data: ${JSON.stringify({

        error: err.message

      })}\n\n`

    );

    res.end();

  }

});


/*
==================================================
START
==================================================
*/

app.listen(PORT, () => {

  console.log(`

========================================
🚀 ROOMRUSH AI ONLINE
🌐 http://localhost:${PORT}
========================================

`);

});