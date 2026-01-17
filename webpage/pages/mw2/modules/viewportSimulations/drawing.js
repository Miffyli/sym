const mw2UserGameplaySettings = {
    fov: 80,
    useAffectedFov: false,
    adsTargetDistanceMeters: 30,
    hipTargetDistanceMeters: 10,
    targetLateralSpeed: 0,
    adsRenderZoom: 1
}

export function setUseAffectedFov(affected) {
    mw2UserGameplaySettings.useAffectedFov = affected;
}

export function setFoV(fov) {
    mw2UserGameplaySettings.fov = fov;
}

export function setAdsRenderZoom(zoom) {
    mw2UserGameplaySettings.adsRenderZoom = zoom;
}

export function setAdsTargetDistance(distanceMeters) {
    mw2UserGameplaySettings.adsTargetDistanceMeters = distanceMeters;
}

export function setHipTargetDistance(distanceMeters) {
    mw2UserGameplaySettings.hipTargetDistanceMeters = distanceMeters;
}

export function mw2Draw(weaponObject) {
    const gun = weaponObject;
    //this can be optimized
    const guyImage = new Image();
    guyImage.onload = function () {
        const watermarkImage = new Image();
        watermarkImage.onload = function () {
            drawADSBallistics(guyImage, watermarkImage);
            drawHipfire(guyImage, watermarkImage);
        }
        watermarkImage.src = "pages/mw2/img/symWatermark.png"
    }
    guyImage.src = "pages/mw2/img/symsoldiergrey.png"

    function drawADSBallistics(soldierImage, watermarkImage) {
        const { fov, adsSpread, idleSway, idleJitter, gunBob, viewBob } = gun.stats;
        const scopeMagnification = gun.stats.scopeMagnification ?? 1;
        const distanceToTarget = mw2UserGameplaySettings.adsTargetDistanceMeters;
        const aimParameters = gun.aimAtTarget(distanceToTarget);
        const renderZoom = mw2UserGameplaySettings.adsRenderZoom;
        const gameSettingsFoV = (fov > 30) ? fov / 80 * mw2UserGameplaySettings.fov : fov;

        const finalCanvas = document.getElementById("mw2ADSBallisticsCanvas");
        const finalCanvasWidth = finalCanvas.width = finalCanvas.clientWidth;
        const finalCanvasHeight = finalCanvas.height = finalCanvas.clientHeight;
        const finalContext = finalCanvas.getContext("2d");

        const hFov = 4 / 3 * (mw2UserGameplaySettings.useAffectedFov ? gameSettingsFoV : fov);
        const vFov = finalCanvasHeight / finalCanvasWidth * hFov;
        
        //create render canvas
        const renderCanvas = document.createElement("canvas");
        const renderWidth = finalCanvasWidth * renderZoom;
        const renderHeight = finalCanvasHeight * renderZoom;
        renderCanvas.width = renderWidth;
        renderCanvas.height = renderHeight;
        const renderContext = renderCanvas.getContext("2d");

        //draw man and environment to render canvas
        const environmentalCanvas = createEnvironmentalCanvas();
        renderContext.drawImage(environmentalCanvas, 0, 0, renderWidth, renderHeight);
        cutScopeFromEnvironmentalCanvas(environmentalCanvas);
        renderContext.drawImage(environmentalCanvas, (renderWidth - renderWidth * scopeMagnification) / 2, (renderHeight - renderHeight * scopeMagnification) / 2);
        environmentalCanvas.remove();
        drawScope(renderCanvas);
        drawWatermark(renderCanvas); //add watermark underneath bounding boxes for clarity
        drawAdsSpread(renderCanvas);
        drawIdleSway(renderCanvas);
        drawGunbob(renderCanvas);
        drawComboIdleSwayGunbob(renderCanvas);
        //copy render canvas to final canvas and delete render canvas
        finalContext.drawImage(renderCanvas, (finalCanvasWidth - renderWidth) / 2, (finalCanvasHeight - renderHeight) / 2);
        renderCanvas.remove();
        drawLegend(finalCanvas);
        drawTitle(finalCanvas);
        return;
        
        function createEnvironmentalCanvas() {
            const canvas = document.createElement("canvas");
            const width = finalCanvasWidth * renderZoom * scopeMagnification;
            const height = finalCanvasHeight * renderZoom * scopeMagnification;
            canvas.width = width;
            canvas.height = height;
            const context = canvas.getContext("2d");

            const targetYAngle = Math.atan(72 * .0254 / distanceToTarget) * 180 / Math.PI;
            const targetYPixels = targetYAngle / vFov * height;
            const targetXPixels = targetYPixels / soldierImage.height * soldierImage.width;
            const headOffsetPixels = 0.4 * targetYPixels;

            const dropYPixels = aimParameters.angle / vFov * height;
            const leadDistance = aimParameters.time * mw2UserGameplaySettings.targetLateralSpeed / 1000;
            const leadXAngle = Math.atan(leadDistance / distanceToTarget) * 180 / Math.PI;
            const leadXPixels = leadXAngle / hFov * width;

            //background
            context.fillStyle = "#495e35";
            context.fillRect(0, 0, width, height);
            context.fillStyle = "#87ceeb";
            context.fillRect(0, 0, width, height / 2 + dropYPixels);
            
            //draw Guy
            context.drawImage(
                soldierImage,
                (width - targetXPixels) / 2 + leadXPixels,
                (height - targetYPixels) / 2 + dropYPixels + headOffsetPixels,
                targetXPixels,
                targetYPixels
            );
            return canvas
        }

        function cutScopeFromEnvironmentalCanvas(environmentalCanvas) {
            const context = environmentalCanvas.getContext("2d");
            const { height, width } = environmentalCanvas;
            context.globalCompositeOperation = "destination-in";
            context.beginPath();
            context.arc(width / 2, height / 2, height / (3 * scopeMagnification) / 2, 0, Math.PI * 2);
            context.fill();
        }

        function drawScope(renderCanvas) {
            const context = renderCanvas.getContext("2d");
            const { height, width } = renderCanvas;
            const scopeDiameter = height / 3;
            //draw crosshair
            context.strokeStyle = "black";
            context.lineWidth = 1;
            context.beginPath();
            context.moveTo(width / 2, (height - scopeDiameter) / 2);
            context.lineTo(width / 2, (height + scopeDiameter) / 2);
            context.moveTo((width - scopeDiameter) / 2, height / 2);
            context.lineTo((width + scopeDiameter) / 2, height / 2);
            context.stroke();

            //draw scope outline
            context.strokeStyle = "black";
            context.lineWidth = 5;
            context.beginPath();
            context.arc(width / 2, height / 2, scopeDiameter / 2, 0, Math.PI * 2);
            context.stroke();
        }

        function drawWatermark(renderCanvas) {
            const context = renderCanvas.getContext("2d");
            const { height, width } = renderCanvas;
            context.globalAlpha = 0.27;
            const watermarkWidth = width * 0.7;
            const watermarkHeight = watermarkWidth / watermarkImage.width * watermarkImage.height;
            context.drawImage(
                watermarkImage,
                (width - watermarkWidth) / 2,
                (height - watermarkHeight) / 2,
                watermarkWidth,
                watermarkHeight
            );
            context.globalAlpha = 1;
        }

        function drawAdsSpread(renderCanvas) {
            const context = renderCanvas.getContext("2d");
            const { height, width } = renderCanvas;
            const scopeDiameter = height / 3;
            const dropYPixels = aimParameters.angle / vFov * height * scopeMagnification;
            const adsSpreadDropPixels = (dropYPixels < scopeDiameter / 2 + 5) ? dropYPixels : dropYPixels / scopeMagnification;
            context.strokeStyle = "red";
            context.lineWidth = 1;
            context.beginPath();
            context.arc(width / 2, height / 2 + adsSpreadDropPixels, adsSpread / hFov * width, 0, Math.PI * 2);
            context.stroke();
        }

        function drawIdleSway(renderCanvas) {
            const context = renderCanvas.getContext("2d");
            const { height, width } = renderCanvas;
            const idleSwayXPixels = (Math.abs(idleSway.Yaw) + Math.abs(idleSway.ViewYaw)) / hFov * width / 100 * 2;
            const idleSwayYPixels = (Math.abs(idleSway.Pitch) + Math.abs(idleSway.ViewPitch)) / vFov * height / 100 * 2;
            const idleJitterXPixels = (Math.abs(idleJitter.Yaw) + Math.abs(idleJitter.ViewYaw)) / hFov * width / 100 * 2;
            const idleJitterYPixels = (Math.abs(idleJitter.Pitch) + Math.abs(idleJitter.ViewPitch)) / vFov * height / 100 * 2;
            context.strokeStyle = "#ff9000";
            context.fillStyle = "#ff9000";
            context.beginPath();
            context.rect((width - idleSwayXPixels) / 2, (height - idleSwayYPixels) / 2, idleSwayXPixels, idleSwayYPixels);
            context.fillRect((width + idleSwayXPixels - idleJitterXPixels) / 2, (height - idleJitterYPixels) / 2, idleJitterXPixels, idleJitterYPixels);
            context.stroke();
        }

        function drawGunbob(renderCanvas) {
            const context = renderCanvas.getContext("2d");
            const { height, width } = renderCanvas;
            const gunBobXPixels = (viewBob + gunBob.yaw) / hFov * width * 2;
            const gunBobYPixels = (viewBob + gunBob.pitch) / vFov * height * 2;
            context.strokeStyle = "#A9D852";
            context.beginPath();
            context.rect((width - gunBobXPixels) / 2, (height - gunBobYPixels) / 2, gunBobXPixels, gunBobYPixels);
            context.stroke();
        }

        function drawComboIdleSwayGunbob(renderCanvas) {
            const context = renderCanvas.getContext("2d");
            const { height, width } = renderCanvas;
            const idleSwayXPixels = (Math.abs(idleSway.Yaw) + Math.abs(idleSway.ViewYaw)) / hFov * width / 100 * 2;
            const idleSwayYPixels = (Math.abs(idleSway.Pitch) + Math.abs(idleSway.ViewPitch)) / vFov * height / 100 * 2;
            const idleJitterXPixels = (Math.abs(idleJitter.Yaw) + Math.abs(idleJitter.ViewYaw)) / hFov * width / 100 * 2;
            const idleJitterYPixels = (Math.abs(idleJitter.Pitch) + Math.abs(idleJitter.ViewPitch)) / vFov * height / 100 * 2;
            const gunBobXPixels = (viewBob + gunBob.yaw) / hFov * width * 2;
            const gunBobYPixels = (viewBob + gunBob.pitch) / vFov * height * 2;
            context.strokeStyle = "#7c40ff";
            context.beginPath();
            const combinedXPixels = idleSwayXPixels + idleJitterXPixels + gunBobXPixels;
            const combinedYPixels = idleSwayYPixels + idleJitterYPixels + gunBobYPixels;
            context.rect((width - combinedXPixels) / 2, (height - combinedYPixels) / 2, combinedXPixels, combinedYPixels);
            context.stroke();
        }

        function drawLegend(finalCanvas) {
            const context = finalCanvas.getContext("2d");
            const { height, width } = finalCanvas;

            context.fillStyle = "#151515";
            context.fillRect(10, height - 160, 200, 150);
            context.fillStyle = "#272727";
            context.fillRect(11, height - 159, 198, 148);
        
            context.strokeStyle = "#F0F0F0";
            context.fillStyle = "#F0F0F0";
            context.font = 'bold 14px Arial';
            context.fillText('ADS Spread', 36, height - 140);
            context.fillText('Idle Sway', 36, height - 110);
            context.fillText('Idle Jitter', 36, height - 80);
            context.fillText('Gun Bob', 36, height - 50);
            context.fillText('Idle Sway And GunBob', 36, height - 20);
            if (renderZoom >= 7 && distanceToTarget <= 5 && fov <= 25) {
                context.fillText('This is totally not good.', 400, height / 1.3);
            }
        
            context.strokeStyle = "red";
            context.lineWidth = 2;
            context.beginPath();
            context.arc(21, height - 145, 5, 0, Math.PI * 2);
            context.stroke();
        
            context.strokeStyle = "#ff9000";
            context.fillStyle = "#ff9000";
            context.beginPath();
            context.rect(16, height - 120, 10, 10);
            context.stroke();
        
            context.fillRect(16, height - 90, 10, 10);
        
            context.beginPath();
            context.strokeStyle = "#A9D852";
            context.rect(16, height - 60, 10, 10);
            context.stroke();
        
            context.strokeStyle = "#7c40ff";
            context.beginPath();
            context.rect(16, height - 30, 10, 10);
            context.stroke();
        }
        
        function drawTitle(finalCanvas) {
            const context = finalCanvas.getContext("2d");
            const { height, width } = finalCanvas;
            context.fillStyle = "#151515";
            context.fillRect(width - 160, height - 440, 150, 40);
            context.fillStyle = "#272727";
            context.fillRect(width - 159, height - 439, 148, 38);
        
            context.strokeStyle = "#F0F0F0";
            context.fillStyle = "#F0F0F0";
            context.font = 'bold 24px Arial';
            context.fillText('ADS', width - 110, height - 412);
        }
    }

    function drawHipfire(soldierImage, watermarkImage) {
        const canvas = document.getElementById("mw2HipfireCanvas");
        const cw = canvas.width = canvas.clientWidth;
        const ch = canvas.height = canvas.clientHeight;
        const ctx = canvas.getContext("2d");
        const distance = mw2UserGameplaySettings.hipTargetDistanceMeters;
        const baseFoV = mw2UserGameplaySettings.fov;
        const hFoV = 4 / 3 * baseFoV;
        const vFoV = ch / cw * hFoV;

        const targetYAngle = Math.atan(72 * .0254 / distance) * 180 / Math.PI;
        const targetYPixels = targetYAngle / vFoV * ch;
        const targetXPixels = targetYPixels / soldierImage.height * soldierImage.width;
        const centerMassOffsetPixels = 0.2 * targetYPixels;

        const hipfire = gun.stats.hipfire;

        //background
        ctx.fillStyle = "#495e35";
        ctx.fillRect(0, 0, cw, ch);
        ctx.fillStyle = "#87ceeb";
        ctx.fillRect(0, 0, cw, ch / 2);

        //draw Guy
        ctx.drawImage(
            soldierImage,
            (cw - targetXPixels) / 2,
            (ch - targetYPixels) / 2 + centerMassOffsetPixels,
            targetXPixels,
            targetYPixels
        );

        //draw watermark
        ctx.globalAlpha = 0.25;
        const wmWidth = cw * 0.7;
        const wmHeight = wmWidth / watermarkImage.width * watermarkImage.height;
        ctx.drawImage(
            watermarkImage,
            (cw - wmWidth) / 2,
            (ch - wmHeight) / 2,
            wmWidth,
            wmHeight
        );
        ctx.globalAlpha = 1;

        //draw min spread
        ctx.strokeStyle = "#A9D852";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(
            cw / 2,
            ch / 2,
            hipfire.min / hFoV * cw,
            0,
            Math.PI * 2
        );
        ctx.stroke();

        //draw max move spread
        ctx.strokeStyle = "#ff9000";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(
            cw / 2,
            ch / 2,
            hipfire.moveMax / hFoV * cw,
            0,
            Math.PI * 2
        );
        ctx.stroke();

        //draw max spread
        ctx.strokeStyle = "red";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(
            cw / 2,
            ch / 2,
            hipfire.max / hFoV * cw,
            0,
            Math.PI * 2
        );
        ctx.stroke();


        //draw legend
        ctx.fillStyle = "#151515";
        ctx.fillRect(10, ch - 100, 200, 90);
        ctx.fillStyle = "#272727";
        ctx.fillRect(11, ch - 99, 198, 88);

        ctx.strokeStyle = "#F0F0F0";
        ctx.fillStyle = "#F0F0F0";
        ctx.font = 'bold 14px Arial';
        ctx.fillText('Minimum Hipfire Spread', 36, ch - 80);
        ctx.fillText('Moving Hipfire Spread', 36, ch - 50);
        ctx.fillText('Firing Hipfire Spread', 36, ch - 20);

        ctx.strokeStyle = "#A9D852";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(21, ch - 85, 5, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = "#FF9000";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(21, ch - 55, 5, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = "red";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(21, ch - 25, 5, 0, Math.PI * 2);
        ctx.stroke();

        //draw title
        ctx.fillStyle = "#151515";
        ctx.fillRect(cw - 160, ch - 440, 150, 40);
        ctx.fillStyle = "#272727";
        ctx.fillRect(cw - 159, ch - 439, 148, 38);

        ctx.strokeStyle = "#F0F0F0";
        ctx.fillStyle = "#F0F0F0";
        ctx.font = 'bold 24px Arial';
        ctx.fillText('Hipfire', cw - 122, ch - 412);
    }
}