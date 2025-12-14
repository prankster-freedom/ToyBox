async function fetchApi(id, method, path, body = null) {
  const responseElement = document.getElementById(`response-${id}`);
  responseElement.textContent = "Fetching...";

  const options = {
    method: method,
    headers: {},
  };

  if (body) {
    options.headers["Content-Type"] = "application/json";
    options.body = body;
  }

  try {
    const response = await fetch(path, options);

    let responseText = `Status: ${response.status}\n\n`;
    let debugInfo;

    if (response.status === 204) {
      responseText += "(No Content)";
    } else {
      const responseData = await response.json();

      // Separate debug info if it exists
      if (responseData._debug) {
        debugInfo = responseData._debug;
        delete responseData._debug;
      }
      responseText += JSON.stringify(responseData, null, 2);
    }

    if (debugInfo) {
      responseText += `\n\n--- DEBUG INFO ---\n${debugInfo.join("\n")}`;
    }

    responseElement.textContent = responseText;
  } catch (error) {
    responseElement.textContent = `Error: ${error.message}`;
    responseElement.textContent = `Error: ${error.message}`;
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const response = await fetch("/user");
    if (response.ok) {
      const user = await response.json();
      if (user && user.id) {
        // Find all inputs that start with 'param-' and end with '-id' or '-userId'
        const inputs = document.querySelectorAll(
          'input[id^="param-"][id$="-id"], input[id^="param-"][id$="-userId"]'
        );
        inputs.forEach((input) => {
          if (!input.value) {
            // Only set if empty
            input.value = user.id;
          }
        });
      }
    }
  } catch (e) {
    console.log("Failed to auto-fill user ID", e);
  }
});
