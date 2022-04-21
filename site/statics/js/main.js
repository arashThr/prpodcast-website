function captureSubscribe () {
    const email = document.getElementById('email-addr').value
    if (!email.match(/^\S+@\S+\.\S+$/)) {
        document.getElementById('email-addr').value = 'Invalid Address'
        return false
    }
    document.getElementById('subscribe-button').value = 'Wait ...';
    document.getElementById('subscribe-button').disabled = true;

    const xhr = new XMLHttpRequest();
    xhr.onload = () => {
        console.log(xhr.responseText)
        alert('Subscribed')
        document.getElementById('subscribe-button').value = 'Subscribed';
        document.getElementById('subscribe-button').disabled = true;
    }
    xhr.open("GET", "https://mljs7s5sqb.execute-api.us-east-2.amazonaws.com/CorsStage/subscribe/" + encodeURIComponent(email));
    xhr.send();
    return false
}

function clearEmail () {
    document.getElementById('email-addr').value = ''
}
