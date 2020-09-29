class UtilService {
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
}

export default UtilService
