"use strict";
// example usage:
const callAJAX = (props) => {
    const url = props.url,
          method = props.method || "GET",
          type = props.type || "JSON",
          header = props.header
    ;
    
    return new Promise(waitForResult => {
        const xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState === 4 && this.status === 200) {
                type === "text" 
                    ? waitForResult(this.response)
                    : waitForResult(JSON.parse(this.response))
                ;
            }
        };
        if (method === "GET") {
            xhttp.open("GET", url, true);
            for (const key in props.header) {
                xhttp.setRequestHeader(key, header[key]);
            }
            xhttp.send();
        }
    });
};

// ----------------------------- Add event listeners for client search -----------------------------
const dom = {
    q: document.getElementById("q"),
    offset: document.getElementById("offset"),
    go: document.getElementById("go"),
    searchParams: document.getElementById("searchParams"),
    images: document.getElementById("images")
};

let qValue,
    offsetValue,
    params
;
dom.q.addEventListener("input", () => {
    qValue = encodeURI(event.target.value.trim().replace(/  +/g, ' '));
    if (qValue.length) {
        (offsetValue && offsetValue.length)
            ? params = `?q=${qValue}&offset=${offsetValue}`
            : params = `?q=${qValue}`
        ;
    } else {
        (offsetValue && offsetValue.length)
            ? params = `?offset=${offsetValue}`
            : params = ""
        ;
    }
    if (params) dom.searchParams.innerHTML = params;
});

dom.offset.addEventListener("input", () => {
    offsetValue = event.target.value;
    if (offsetValue.length) {
        qValue.length 
            ? params = `?q=${qValue}&offset=${offsetValue}`
            : params = `?offset=${offsetValue}`
        ;
    } else {
        qValue.length 
            ? params = `?q=${qValue}`
            : params = ""
        ;
    }
    if (params) dom.searchParams.innerHTML = params;
});

// ----------------------------- Call AJAX -----------------------------
dom.go.addEventListener("click", () => {
    const AJAXProps = {
        url: `https://aromatic-iridium.glitch.me/api/imagesearch/${params ? params : ""}`
    };
    callAJAX(AJAXProps).then(response => {
        let imgThumbnails = "";
        response.forEach(value => {
            imgThumbnails += `
                <div class="img-container">
                    <img src="${value.thumbnail}" />
                    <a href="${value.author ? value.author.link : ''}" target="_blank"><h4>${value.author ? value.author.name : ''}</h4></a>
                </div>`
            ;
        });
        dom.images.innerHTML = imgThumbnails;
    });
});




const images = document.getElementById("images");

// ----------------------------- footer: -----------------------------
const developed = document.getElementById("developed");
const presentYear = document.getElementById("presentYear");
const present = new Date;
const year = present.getFullYear();
if (year > developed.innerHTML) {
    presentYear.innerHTML = `-${year}.`;
}
