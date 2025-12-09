# Passo a Passo para Integração com Google Sheets

Para salvar os dados desta pesquisa em uma planilha, usaremos o Google Apps Script.

## 1. Preparar a Planilha
1. Crie uma nova planilha no Google Sheets (sheets.new).
2. Na primeira linha (Cabeçalho), adicione EXATAMENTE os seguintes nomes nas colunas A até K:
   `id`, `tel`, `nome`, `cpfcnpj_autor`, `nota_atendimento`, `nota_comprando`, `nota_recomendar`, `melhor_`, `pior_`, `sugest`, `dtpesquisa`

## 2. Criar o Script de Backend
1. Na planilha, clique em **Extensões** > **Apps Script**.
2. Apague qualquer código que estiver no arquivo `Código.gs` e cole o código abaixo:

```javascript
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
```

## 3. Publicar o Script
1. Clique no botão **Implantar** (azul, canto superior direito) > **Nova implantação**.
2. Clique na engrenagem (Configurações) e selecione **App da Web**.
3. Preencha:
   - **Descrição:** API Pesquisa
   - **Executar como:** *Eu* (seu email).
   - **Quem pode acessar:** *Qualquer pessoa* (Isso é crucial para funcionar sem login do usuário).
4. Clique em **Implantar**.
5. Copie a **URL do app da web** gerada (algo como `https://script.google.com/macros/s/.../exec`).

## 4. Conectar ao App React
1. Abra o arquivo `constants.ts` no projeto React.
2. Substitua o valor de `GOOGLE_SCRIPT_URL` pela URL que você copiou.
   ```typescript
   export const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/SEU_CODIGO_AQUI/exec";
   ```
3. Salve e rode o projeto.