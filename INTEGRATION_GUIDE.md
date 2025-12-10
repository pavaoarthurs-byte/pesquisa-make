# Passo a Passo para Integração com Google Sheets

Para salvar os dados desta pesquisa em uma planilha e também buscar dinamicamente as palavras mais usadas, usaremos o Google Apps Script.

## 1. Preparar a Planilha
1. Crie uma nova planilha no Google Sheets (sheets.new).
2. Na primeira linha (Cabeçalho), adicione EXATAMENTE os seguintes nomes nas colunas A até K:
   `id`, `tel`, `nome`, `cpfcnpj_autor`, `nota_atendimento`, `nota_comprando`, `nota_recomendar`, `melhor_`, `pior_`, `sugest`, `dtpesquisa`

## 2. Criar o Script de Backend
1. Na planilha, clique em **Extensões** > **Apps Script**.
2. Apague qualquer código que estiver no arquivo `Código.gs` e cole o código abaixo:

```javascript
// Função para Salvar Dados (POST)
function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    var doc = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = doc.getSheets()[0]; // Pega a primeira aba

    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    var nextRow = sheet.getLastRow() + 1;

    var postData = JSON.parse(e.postData.contents);
    var newRow = [];

    // Mapeia os dados recebidos para as colunas corretas
    for (var i = 0; i < headers.length; i++) {
      var header = headers[i];
      // Se o dado existir no payload, adiciona, senão deixa vazio
      newRow.push(postData[header] ? postData[header] : "");
    }

    sheet.getRange(nextRow, 1, 1, newRow.length).setValues([newRow]);

    return ContentService
      .createTextOutput(JSON.stringify({ "result": "success", "row": nextRow }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (e) {
    return ContentService
      .createTextOutput(JSON.stringify({ "result": "error", "error": e }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

// Função para Buscar Top Palavras (GET)
function doGet(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
    var lastRow = sheet.getLastRow();

    if (lastRow < 2) {
      // Se não houver dados, retorna listas vazias
      return ContentService.createTextOutput(JSON.stringify({ "result": "success", "best": [], "worst": [] }))
             .setMimeType(ContentService.MimeType.JSON);
    }

    var data = sheet.getRange(1, 1, lastRow, sheet.getLastColumn()).getValues();
    var headers = data[0];
    
    var bestColIndex = headers.indexOf("melhor_");
    var worstColIndex = headers.indexOf("pior_");

    if (bestColIndex === -1 || worstColIndex === -1) {
      throw new Error("Colunas 'melhor_' ou 'pior_' não encontradas.");
    }

    var bestWords = {};
    var worstWords = {};

    // Começa do índice 1 para pular cabeçalho
    for (var i = 1; i < data.length; i++) {
      var bestVal = data[i][bestColIndex];
      var worstVal = data[i][worstColIndex];

      if (bestVal && bestVal !== "Nada") {
        // Normaliza para Title Case para contagem
        var cleanBest = toTitleCase(String(bestVal).trim());
        bestWords[cleanBest] = (bestWords[cleanBest] || 0) + 1;
      }
      if (worstVal && worstVal !== "Nada") {
        var cleanWorst = toTitleCase(String(worstVal).trim());
        worstWords[cleanWorst] = (worstWords[cleanWorst] || 0) + 1;
      }
    }

    // Pega o Top 6
    var topBest = getTopKeys(bestWords, 6);
    var topWorst = getTopKeys(worstWords, 6);

    return ContentService
      .createTextOutput(JSON.stringify({ 
        "result": "success", 
        "best": topBest, 
        "worst": topWorst 
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (e) {
    return ContentService
      .createTextOutput(JSON.stringify({ "result": "error", "error": e.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function getTopKeys(obj, n) {
  var keys = Object.keys(obj);
  // Ordena por contagem decrescente
  keys.sort(function(a, b) { return obj[b] - obj[a] });
  return keys.slice(0, n);
}

function toTitleCase(str) {
  return str.replace(/\w\S*/g, function(txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
}
```

## 3. Publicar o Script (ATENÇÃO AQUI)
Se você já publicou antes, **você precisa criar uma nova versão** para que as alterações no código (o novo `doGet`) funcionem:

1. Clique no botão **Implantar** (azul, canto superior direito) > **Gerenciar implantações**.
2. Clique no ícone de **Lápis (Editar)** no topo direito da janela.
3. Em **Versão**, mude de "Versão arquivada" ou "1" para **Nova versão**.
4. Certifique-se de que "Quem pode acessar" continua como **Qualquer pessoa**.
5. Clique em **Implantar**.
6. A URL deve permanecer a mesma (terminada em `/exec`). Caso mude, atualize o arquivo `constants.ts`.

## 4. Conectar ao App React
1. Abra o arquivo `constants.ts` no projeto React.
2. Certifique-se de que a `GOOGLE_SCRIPT_URL` é a mesma que aparece na implantação.
   ```typescript
   export const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/SEU_CODIGO_AQUI/exec";
   ```
3. Salve e rode o projeto.