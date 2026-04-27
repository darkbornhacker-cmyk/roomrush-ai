async function sendMessage() {

  const content = userInput.value.trim();

  if (!content || abortController) return;

  userInput.value = '';

  userInput.style.height = 'auto';

  sendBtn.disabled = true;


  const chat = chats[currentChatId];

  chat.messages.push({
    role: 'user',
    content
  });


  if (chat.messages.length === 1) {

    chat.title =
      content.slice(0, 30) +
      (content.length > 30 ? '...' : '');

    if (chatTitle) {
      chatTitle.textContent = chat.title;
    }
  }


  saveChats();

  renderMessages();

  renderHistory();


  const loadingDiv = addMessage(
    'assistant',
    'Pensando...'
  );


  sendBtn.style.display = 'none';

  stopBtn.style.display = 'flex';


  try {

    const response = await fetch(
      '/api/chat',
      {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json'
        },

        body: JSON.stringify({
          messages: chat.messages
        })
      }
    );


    const data = await response.json();


    loadingDiv.remove();


    if (data.error) {

      updateLastMessage(
        `❌ ${data.error}`
      );

      return;
    }


    const assistantContent =
      data.response || 'Sem resposta';


    updateLastMessage(
      assistantContent
    );


    chat.messages.push({

      role: 'assistant',

      content: assistantContent

    });


    saveChats();

    renderHistory();


    tokenCount.textContent =
      `${assistantContent.length} caracteres`;


  } catch (error) {

    loadingDiv.remove();

    updateLastMessage(
      `❌ ${error.message}`
    );

  } finally {

    sendBtn.style.display = 'flex';

    stopBtn.style.display = 'none';

    sendBtn.disabled = false;
  }
}