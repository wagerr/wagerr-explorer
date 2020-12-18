
Number.prototype.toFixedNoRounding = function(n) {
    const reg = new RegExp("^-?\\d+(?:\\.\\d{0," + n + "})?", "g")
    const a = this.toString().match(reg)[0];
    const dot = a.indexOf(".");
    if (dot === -1) { // integer, insert decimal dot and pad up zeros
        return a + "." + "0".repeat(n);
    }
    const b = n - (a.length - dot) + 1;
    return b > 0 ? (a + "0".repeat(b)) : a;
  }

class ClientUtils {
    static prettyBalance = (bn_balance) => {
        return bn_balance.dividedBy(10**8).dp(6,3).toString()
    }
    
    static convertToOdds = (odds, is_American, is_Decimal) => {
        let ret = odds;
        if (is_American) {
            odds = parseFloat(odds);
            ret = parseInt((odds - 1) * 100);

            if (odds < 2)
                ret = Math.round((-100) / (odds - 1));

            if (odds == 0) ret = 0;
        }

        if (is_Decimal) {
            ret = ret == 0 ? ret : (1 + (ret - 1) * 0.94).toFixedNoRounding(2);
        }

        if (ret > 0 && is_American) ret = `+${ret}`
        return ret;
    }

    static getHeader(path) {
        let name = ''
        if (path.includes('#/bethistory')) {
            name = 'Bet History '
        } if (path.includes('#/betting')) {
            name = 'Betting '
        } if (path.includes('#/lottos')) {
            name = 'Chain Game '
        } if (path.includes('#/help')) {
            name = 'Help '
        } if (path.includes('#/')) {
            name = 'Overview '
        } 
        return name
    }

    static displayNum = (num, divider) => {
        const value = num > 0 ? `+${num / divider}` : `${num / divider}`;
        
        return value;
      };

}

export default ClientUtils