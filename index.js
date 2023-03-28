addEventListener('fetch', function(event) {
    const { request } = event
    const response = handleRequest(request)
    event.respondWith(response)
})

const doh = 'https://dns.google/dns-query'
const dohjson = 'https://dns.google/resolve'
const contype = 'application/dns-message'
const jstontype = 'application/dns-json'

async function handleRequest(request) {
    
    const { method, headers, url } = request
    const searchParams = new URL(url).searchParams
    if (method == 'GET' && searchParams.has('dns')) {
        return await fetch(doh + '?dns=' + searchParams.get('dns')+'&edns_client_subnet=110.53.162.0/24', {
            method: 'GET',
            headers: {
                'Accept': contype,
            }
        });
    } else if (method == 'POST' && headers.get('content-type')==contype) {
        return await fetch(doh, {
            method: 'POST',
            headers: {
                'Accept': contype,
                'Content-Type': contype,
            },
            body: await request.arrayBuffer()
        });
    } else if (method== 'GET' && headers.get('Accept')==jstontype) {
        const search = new URL(url).search
        const result = await fetch(dohjson + search + '&edns_client_subnet=110.53.162.0/24', {
            method: 'GET',
            headers: {
                'Accept': jstontype,
            }
        });
        const secondCheck = await result.clone().json();
        if (secondCheck['Status'] == 0) {
            return result
        } else {
            // Some request name can't work with edns
            // "Status": 5 /* REFUSED */,
            return await fetch(dohjson + search, {
                method: 'GET',
                headers: {
                    'Accept': jstontype,
                }
            });
        }
    } else {
        return new Response("", {status: 404})
    }
}
