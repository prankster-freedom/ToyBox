async function fetchApi(id, method, path, body = null) {
    const responseElement = document.getElementById(`response-${id}`);
    responseElement.textContent = 'Fetching...';

    const options = {
        method: method,
        headers: {}
    };

    if (body) {
        options.headers['Content-Type'] = 'application/json';
        options.body = body;
    }

    try {
        const response = await fetch(path, options);
        const responseData = await response.json();

        // Separate debug info if it exists
        let debugInfo = null;
        if (responseData._debug) {
            debugInfo = responseData._debug;
            delete responseData._debug;
        }

        let responseText = `Status: ${response.status}\n\n${JSON.stringify(responseData, null, 2)}`;
        
        if (debugInfo) {
            responseText += `\n\n--- DEBUG INFO ---\n${debugInfo.join('\n')}`;
        }

        responseElement.textContent = responseText;
    } catch (error) {
        responseElement.textContent = `Error: ${error.message}`;
    }
}