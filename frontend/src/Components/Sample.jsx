import axios from 'axios';
import { embedDashboard } from "@superset-ui/embedded-sdk";


    const supersetUrl = 'http://localhost:8088'
    const supersetApiUrl = supersetUrl + '/api/v1/security'
    const dashboardId = "6365ca7e-7cf0-4c17-b336-6c4767a746bd"

    async function getToken() {

    const login_body = {
        "password": "admin",
        "provider": "db",
        "refresh": true,
        "username": "admin"
    };

    const login_headers = {
        "headers": {
        "Content-Type": "application/json"
        }
    }


    console.log(supersetApiUrl + '/login')
    const { data } = await axios.post(supersetApiUrl + '/login', login_body, login_headers)
    const access_token = data['access_token']
    console.log(access_token)



    const guest_token_body = JSON.stringify({
        "resources": [
        {
            "type": "dashboard",
            "id": dashboardId,
        }
        ],
        "rls": [],
        "user": {
        "username": "admin",
        "first_name": "Gangey",
        "last_name": "Patel",
        }
    });

    const guest_token_headers = {
        "headers": {
        "Content-Type": "application/json",
        "Authorization": 'Bearer ' + access_token
        }
    }


    console.log(supersetApiUrl + '/guest_token/')
    console.log(guest_token_body)
    console.log(guest_token_headers)
    await axios.post(supersetApiUrl + '/guest_token/', guest_token_body, guest_token_headers).then(dt=>{
        console.log(dt.data['token'])
        embedDashboard({
            id: dashboardId,  
            supersetDomain: supersetUrl,
            mountPoint: document.getElementById("superset-container"),
            fetchGuestToken: () => dt.data['token'],
            dashboardUiConfig: { hideTitle: true }
        });
    })

    var iframe = document.querySelector("iframe")
    if (iframe) {
        iframe.style.width = '100%'; 
        iframe.style.minHeight = '100vw'; 
    }
    }

const Sample = () => {
    getToken()
  return (
    <>
        <div id='superset-container'></div>
    </>
  )
}

export default Sample