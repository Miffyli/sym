import * as SelectedGuns from "../selectedGuns.js";

export const observerOptions = {
    threshold: 0.25,
};

export function getYMaxOfData(data) {
    return data.reduce((previous, series) => {
        const yMaxInLine = series.data.reduce((prev, point) => {
            return Math.max(prev, point[1]);
        }, Number.MIN_VALUE);
        return  Math.max(previous, yMaxInLine);
    }, Number.MIN_VALUE);
}

export function getDamageBasedChartLength() {
    const farthestRange = SelectedGuns.getFarthestRangeOfSelectedGuns();
    return Math.max(10, Math.ceil(farthestRange * 1.25 / 10) * 10);
}

export function createPointsFromRangeProfile(rangeProfile) {
    const reversed = rangeProfile.slice().reverse();
    return Array.from({length: 501}, (x, index) => {
        const profileEntry = reversed.find(([range, value]) => {
            return index >= range;
        });
        return [index, profileEntry[1]];
    });
}