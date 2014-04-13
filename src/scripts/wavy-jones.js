var WavyJones = function (context, elem) {
    var analyser = context.createAnalyser(),
        elem = document.getElementById(elem),
        svgNamespace = "http://www.w3.org/2000/svg",
        oscLine = document.createElementNS(svgNamespace, "path"),
        paper = document.createElementNS(svgNamespace, "svg"),
        noDataPoints = 10,
        freqData = new Uint8Array(analyser.frequencyBinCount);
  
    analyser.width = elem.offsetWidth;
    analyser.height = elem.offsetHeight;
    analyser.lineColor = 'transparent';
    analyser.lineThickness = 5;

    paper.setAttribute('width', analyser.width);
    paper.setAttribute('height', analyser.height);
    paper.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", "http://www.w3.org/1999/xlink");

    elem.appendChild(paper); 

    oscLine.setAttribute("stroke", analyser.lineColor);
    oscLine.setAttribute("stroke-width", analyser.lineThickness);
    oscLine.setAttribute("fill","none");
    paper.appendChild(oscLine);

    var drawLine = function () {
        var graphPoints = [],
            graphStr = '',
            point,
            pixels_per_point = 0;
        
        analyser.getByteTimeDomainData(freqData);
        pixels_per_point = analyser.width / freqData.length;

        graphPoints.push('M0, ' + (analyser.height/2));

        for (var i = 0; i < freqData.length; i++) {
            if (i % noDataPoints) {
                point = (freqData[i] / 128) * (analyser.height / 2);
                graphPoints.push('L' + (i * pixels_per_point) + ', ' + point); 
            }
        }

        for (i = 0; i < graphPoints.length; i++) {
            graphStr += graphPoints[i];
        }

        oscLine.setAttribute("stroke", analyser.lineColor);
        oscLine.setAttribute("stroke-width", analyser.lineThickness);
        oscLine.setAttribute("d", graphStr);

        setTimeout(drawLine, 100);
    };

    drawLine();

    return analyser;
};
