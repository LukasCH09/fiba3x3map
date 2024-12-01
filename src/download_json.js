import fetch from 'node-fetch';
import { writeFileSync } from 'fs';

fetch('https://play.fiba3x3.com/api/v2/search/events?name=&input=&when=future&distance=1000&pageNum=1')
    .then(response => response.json())
    .then(data => {
        writeFileSync('daily_tournament_fetch.json', JSON.stringify(data, null, 2));
    })
    .catch(error => console.error('Error fetching JSON:', error));