(function () {
    'use strict';

    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    var finePointer = window.matchMedia('(pointer: fine)');
    if (reducedMotion.matches || !finePointer.matches) return;

    var canvas = document.createElement('canvas');
    canvas.className = 'cursor-glow-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.appendChild(canvas);

    var context = canvas.getContext('2d');
    var points = Array.from({ length: 8 }, function () { return { x: -100, y: -100 }; });
    var target = { x: -100, y: -100 };
    var visible = false;
    var frameId;

    function resize() {
        var scale = Math.min(window.devicePixelRatio || 1, 1.5);
        canvas.width = Math.round(window.innerWidth * scale);
        canvas.height = Math.round(window.innerHeight * scale);
        canvas.style.width = window.innerWidth + 'px';
        canvas.style.height = window.innerHeight + 'px';
        context.setTransform(scale, 0, 0, scale, 0, 0);
    }

    function move(event) {
        target.x = event.clientX;
        target.y = event.clientY;
        if (!visible) {
            points.forEach(function (point) { point.x = target.x; point.y = target.y; });
            visible = true;
        }
    }

    function leave() {
        visible = false;
    }

    function render() {
        context.clearRect(0, 0, window.innerWidth, window.innerHeight);
        if (visible) {
            points[0].x += (target.x - points[0].x) * 0.32;
            points[0].y += (target.y - points[0].y) * 0.32;

            for (var i = 1; i < points.length; i++) {
                points[i].x += (points[i - 1].x - points[i].x) * 0.25;
                points[i].y += (points[i - 1].y - points[i].y) * 0.25;
            }

            for (var j = points.length - 1; j >= 1; j--) {
                var start = points[j];
                var end = points[j - 1];
                var gradient = context.createLinearGradient(start.x, start.y, end.x, end.y);
                gradient.addColorStop(0, 'rgba(60, 130, 204, 0)');
                gradient.addColorStop(1, 'rgba(240, 129, 46, 0.30)');
                context.strokeStyle = gradient;
                context.lineWidth = Math.max(1, 5 - j * 0.26);
                context.lineCap = 'round';
                context.beginPath();
                context.moveTo(start.x, start.y);
                context.lineTo(end.x, end.y);
                context.stroke();
            }

            var glow = context.createRadialGradient(points[0].x, points[0].y, 0, points[0].x, points[0].y, 12);
            glow.addColorStop(0, 'rgba(255, 255, 255, 0.72)');
            glow.addColorStop(0.22, 'rgba(240, 129, 46, 0.45)');
            glow.addColorStop(1, 'rgba(60, 130, 204, 0)');
            context.fillStyle = glow;
            context.beginPath();
            context.arc(points[0].x, points[0].y, 18, 0, Math.PI * 2);
            context.fill();
        }
        frameId = window.requestAnimationFrame(render);
    }

    window.addEventListener('resize', resize, { passive: true });
    window.addEventListener('pointermove', move, { passive: true });
    document.addEventListener('mouseleave', leave);
    document.addEventListener('visibilitychange', function () {
        if (document.hidden) window.cancelAnimationFrame(frameId);
        else frameId = window.requestAnimationFrame(render);
    });

    resize();
    frameId = window.requestAnimationFrame(render);
})();
