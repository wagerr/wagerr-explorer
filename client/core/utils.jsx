class Utils {
    static getWidth(width) {
        let result = width < 1640 && (width < 767 ? 1438 : 1467)
        return result;
    }

    static tableWidth(width) {
        let result = width > 767 ? width-320 : width-27
        if(width < 600 ) {
            result = width - 10
        }
        return result;
    }
}

export default Utils
