"use strict";

const express = require('express');
const app = express();
// https://www.twilio.com/blog/2017/08/http-requests-in-node-js.html
const superagent = require('superagent');
const fs = require('fs');

app.get("/api/imagesearch", (request, response) => {
    let url = "https://www.googleapis.com/customsearch/v1",
        sendResponse = []
    ;
    const q = request.query.q,
          start = + (request.query.offset || 0) + 1;
    ;
    
    const pixabay = googleError => {
        // When the request hit the daily limit on google, jump to pixabay API:
        url ="https://pixabay.com/api/";
        
        superagent
            .get(url)
            .query({
                key: process.env.PIXABAY_KEY, // my pixabay key
                q: q,
                page: start,
                per_page: 10
            })
            .end((err, res) => {
                if (err) {
                    return response.send(err);
                } else {
                    // build response JSON for client
//                    googleError = JSON.parse(googleError);
                    let index = {    
                        error: googleError,
                        url: "https://pixabay.com/static/img/public/medium_rectangle_a.png",
                        thumbnail: "https://pixabay.com/static/img/public/medium_rectangle_a.png",
                        thumbnail2: "https://pixabay.com/static/img/public/leaderboard_a.png",
                        thumbnail3: "https://pixabay.com/static/img/public/leaderboard_b.png.png",
                        thumbnail4: "https://pixabay.com/static/img/logo.png",
                        thumbnail5: "https://pixabay.com/static/img/logo.png",
                        snippet: `A link to Pixabay is required and you may use any logo for this purpose`,
                        context: "https://pixabay.com",
                        author: {
                            name: "pixabay",
                            link: `https://pixabay.com`
                        }
                    };
                    sendResponse.push(index);
                    res.body.hits.forEach(item => {
                        index = {};
                        index.url = item.largeImageURL;
                        index.snippet = `${item.type} by ${item.user} from pixabay: ${item.tags}`;
                        index.author = {
                            name: item.user,
                            link: `https://pixabay.com/users/${item.user}-${item.user_id}`
                        };
                        index.thumbnail = item.previewURL;
                        index.context = item.pageURL;
                        sendResponse.push(index);
                    });
                    response.send(sendResponse);
                }
                
            })
        ;
    };
    
    superagent
        .get(url)
        .query({ // add parameters to the request:
            key: process.env.KEY,
            cx: process.env.CX,
            searchType: "image",
            q: q,
            start: start
        })
        .end((err, res) => {
            if (err) {
                // hit the request limit on google or get another error => jumpt to pixabay API
                err.response.res.text = JSON.parse(err.response.res.text);
                pixabay(err.response.res.text);
            } else {
                // build response JSON for client
                res.body.items.forEach(item => {
                    let index = {};
                    index.context = item.image.contextLink;
                    index.snippet = item.snippet;
                    index.thumbnail = item.image.thumbnailLink;
                    index.url = item.link;
                    sendResponse.push(index);
                });
                response.send(sendResponse);
            }
            
            // save the query to the latest.json file:
            const lastSearch = {
                      term: q || " ",
                      when: Date.now()
                  }
            ;
            let queryJson = [];
            // read the data of the most recently submitted search from latest.json:
            fs.readFile("json/latest.json", "utf8", (error, data) => {
                if (!(data)) {
                    queryJson.push(lastSearch); 
                } else {
                    queryJson = JSON.parse(data);
                    if (queryJson.length > 9) {
                        queryJson.push(lastSearch); 
                        queryJson.shift(); 
                    } else {
                        queryJson.push(lastSearch);
                    }
                }
                fs.writeFile("json/latest.json", JSON.stringify(queryJson), error => {
                    if (error) throw error;
                });
            });
        })
    ;
});

app.get("/api/latest/imagesearch", (request, response) => {
    fs.readFile("json/latest.json", "utf8", (error, data) => {
        const latestSearch = JSON.parse(data);
        response.send(latestSearch);
    });
});

module.exports = app;
