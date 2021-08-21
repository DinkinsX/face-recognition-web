const video = document.getElementById('video');




const loadLabels = () => {
    const labels = ['Vokhrin'];
    return Promise.all(labels.map(async label => {
        const descriptions = [];
        for (let i = 1; i <= 2; i++) {
            const img = await faceapi.fetchImage(`../${label}/${i}.jpg`)
            const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();
            descriptions.push(detections.descriptor);
        }
        return new faceapi.LabeledFaceDescriptors(label, descriptions)
    }))
}



const content = document.querySelector('.main');
const menu = document.querySelector('.video');
const button = document.querySelector('button');

button.addEventListener('click', () => {


    function startVideo() {
        navigator.getUserMedia(
            {video: {}},
            stream => video.srcObject = stream,
            err => console.error(err)
        );
    }
    
    Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
        faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
        faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
        faceapi.nets.faceExpressionNet.loadFromUri('/models'),
        faceapi.nets.ssdMobilenetv1.loadFromUri('/models')
    ]).then(startVideo);
    
    
    video.addEventListener('play', async () => {
        const labels = await loadLabels();
        const canvas = faceapi.createCanvasFromMedia(video);
        menu.append(canvas);
        const displaySize = { width: video.width, height: video.height };
        faceapi.matchDimensions(canvas, displaySize);
    
        setInterval(async () => {
            const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions().withFaceDescriptors()
            console.log(detections);
            const resizedDetections = faceapi.resizeResults(detections, displaySize);
            canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
            faceapi.draw.drawDetections(canvas, resizedDetections);
            faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
            // faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
    
    
            const faceMatcher = new faceapi.FaceMatcher(labels, 0.6);
            
            const results = resizedDetections.map(d => faceMatcher.findBestMatch(d.descriptor));
            console.log(results)
            const div = document.querySelector('.content');
            console.log(div)
            if (div && results.length === 0) {
                div.remove();
            }
    
            results.forEach((result, i) => {
                const box = resizedDetections[i].detection.box;
                const {label, distance} = result;
                new faceapi.draw.DrawTextField([`${label}, (${distance.toFixed(2)})`], box.bottomRight).draw(canvas);
                if (!div && distance < 0.6) {
                    const div = document.createElement('div');
                    div.classList.add('content');
                    div.innerHTML = `<h3>Данные моей карты:</h3>
                    <p>The navbar will stick to the top when you reach its scroll position.</p>
                    <p>Some text to enable scrolling.. Lorem ipsum dolor sit amet, illum definitiones no quo, maluisset concludaturque et eum, altera fabulas ut quo. Atqui causae gloriatur ius te, id agam omnis evertitur eum. Affert laboramus repudiandaes ad. Eum no molestiae voluptatibus.</p>
                    <p>Some text to enable scrolling.. Lorem ipsum dolor sit amet, illum definitiones no quo, maluisset concludaturque et eum, altera fabulas ut quo. Atqui causae gloriatur ius te, id agam omnis evertitur eum. Affert laboramus repudiandae nec et. Inciderint efficiantur his ad. Eum no molestiae voluptatibus.</p>
                    <p>Some text to enable scrolling.. Lorem ipsum dolor sit amet, illum definitiones no quo, maluisset concludaturque et eum, altera fabulas ut quo. Atqui causae gloriatur ius te, id agam omnis evertitur eum. Affert laboramus repudiandae nec et. Inciderint efficiantur his ad. Eum no molestiae voluptatibus.</p>
                    <p>Some text to enable scrolling.. Lorem ipsum dolor sit amet, illum definitiones no quo, maluisset concludaturque et eum, altera fabulas ut quo. Atqui causae gloriatur ius te, id agam omnis evertitur eum. Affert laboramus repudiandae nec et. Inciderint efficiantur his ad. Eum no molestiae voluptatibus.</p>
                    <p>Some text to enable scrolling.. Lorem ipsum dolor sit amet, illum definitiones no quo, maluisset concludaturque et eum, altera fabulas ut quo. Atqui causae gloriatur ius te, id agam omnis evertitur eum. Affert laboramus repudiandae nec et. Inciderint efficiantur his ad. Eum no molestiae voluptatibus.</p>
                    <p>Some text to enable scrolling.. Lorem ipsum dolor sit amet, illum definitiones no quo, maluisset concludaturque et eum, altera fabulas ut quo. Atqui causae gloriatur ius te, id agam omnis evertitur eum. Affert laboramus repudiandae nec et. Inciderint efficiantur his ad. Eum no molestiae voluptatibus.</p>
                    <p>Some text to enable scrolling.. Lorem ipsum dolor sit amet, illum definitiones no quo, maluisset concludaturque et eum, altera fabulas ut quo. Atqui causae gloriatur ius te, id agam omnis evertitur eum. Affert laboramus repudiandae nec et. Inciderint efficiantur hi nec et. Inciderint efficiantur his ad. Eum no molestiae voluptatibus.</p>`
                    content.append(div);
    
                } else if (div && distance > 0.6){
                    div.remove();
                }
            });
            
        }, 1000);
    });




});
