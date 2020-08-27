class UtilService {
    static getHeader(path) {
        let name = ''
        if (path.includes('#/explorer')) {
            name = 'Overview '
        } if (path.includes('#/bethistory')) {
            name = 'Bet History '
        } if (path.includes('#/betting')) {
            name = 'Betting '
        } if (path.includes('#/lottos')) {
            name = 'Chain Game '
        } if (path.includes('#/help')) {
            name = 'Help '
        }
        return name
    }
}

export default UtilService
