const {h, Component} = require('preact')

const Goban = require('./Goban')
const PlayBar = require('./PlayBar')
const EditBar = require('./EditBar')
const GuessBar = require('./GuessBar')
const AutoplayBar = require('./AutoplayBar')
const ScoringBar = require('./ScoringBar')
const EstimatorBar = require('./EstimatorBar')
const FindBar = require('./FindBar')

const $ = require('../modules/sprint')
const gametree = require('../modules/gametree')

class MainView extends Component {
    constructor() {
        super()

        this.handleTogglePlayer = () => sabaki.setPlayer(...this.props.treePosition, -this.props.currentPlayer)
        this.handleToolButtonClick = evt => sabaki.setSelectedTool(evt.toolId)
        this.handleGobanResize = this.handleGobanResize.bind(this)
        this.handleGobanVertexClick = this.handleGobanVertexClick.bind(this)
        this.handleGobanLineDraw = this.handleGobanLineDraw.bind(this)
    }

    componentDidMount() {
        // Handle mouse scrolling

        this.mainElement.addEventListener('wheel', evt => {
            evt.preventDefault()
            sabaki.goStep(Math.sign(evt.deltaY))
        })
    }

    handleGobanResize() {
        /*  Because of board rendering issues, we want the width
            and the height of `<main>` to be even */

        let $main = $(this.mainElement).css('width', '').css('height', '')

        let width = Math.round($main.width()
            - parseFloat($main.css('padding-left'))
            - parseFloat($main.css('padding-right')))
        let height = Math.round($main.height()
            - parseFloat($main.css('padding-top'))
            - parseFloat($main.css('padding-bottom')))

        if (width % 2 !== 0) width++
        if (height % 2 !== 0) height++

        this.setState({width, height})
    }

    handleGobanVertexClick(evt) {
        sabaki.clickVertex(evt.vertex, evt)
    }

    handleGobanLineDraw(evt) {
        let [v1, v2] = evt.line
        sabaki.useTool(this.props.selectedTool, v1, v2)
        sabaki.editVertexData = null
    }

    render({
        mode,
        treePosition,
        currentPlayer,
        gameInfo,

        deadStones,
        scoreBoard,
        areaMap,

        highlightVertices,
        showCoordinates,
        showMoveColorization,
        showNextMoves,
        showSiblings,
        fuzzyStonePlacement,
        animatedStonePlacement,
        animatedVertex,

        undoable,
        undoText,
        selectedTool,
        secondsPerMove,
        autoplaying,
        findText,
        findVertex,

        showGameGraph,
        showCommentBox,
        sidebarWidth
    }, {
        width,
        height
    }) {
        let [tree, index] = treePosition
        let board = gametree.getBoard(tree, index)
        let node = tree.nodes[index]
        let showSidebar = showGameGraph || showCommentBox

        return h('section',
            {
                id: 'main',
                style: {right: showSidebar ? sidebarWidth : null}
            },

            h('main',
                {
                    ref: el => this.mainElement = el,
                    style: {width, height}
                },

                h(Goban, {
                    board,
                    highlightVertices: findVertex ? [findVertex] : highlightVertices,
                    paintMap: areaMap,
                    dimmedStones: ['scoring', 'estimator'].includes(mode) ? deadStones : [],

                    showCoordinates,
                    showMoveColorization,
                    showNextMoves,
                    showSiblings,
                    fuzzyStonePlacement,
                    animatedStonePlacement,
                    animatedVertex,

                    drawLineMode: mode === 'edit' && ['arrow', 'line'].includes(selectedTool)
                        ? selectedTool : null,

                    onBeforeResize: this.handleGobanResize,
                    onVertexClick: this.handleGobanVertexClick,
                    onLineDraw: this.handleGobanLineDraw
                })
            ),

            h('section', {id: 'bar'},
                h(PlayBar, {
                    mode,
                    playerNames: gameInfo.playerNames,
                    playerRanks: gameInfo.playerRanks,
                    playerCaptures: board.captures,
                    currentPlayer,
                    showHotspot: 'HO' in node,
                    undoable,
                    undoText,
                    onCurrentPlayerClick: this.handleTogglePlayer
                }),

                h(EditBar, {
                    mode,
                    selectedTool,
                    onToolButtonClick: this.handleToolButtonClick
                }),

                h(GuessBar, {
                    mode
                }),

                h(AutoplayBar, {
                    mode,
                    playing: autoplaying,
                    secondsPerMove
                }),

                h(ScoringBar, {
                    mode,
                    scoreBoard
                }),

                h(EstimatorBar, {
                    mode,
                    scoreBoard
                }),

                h(FindBar, {
                    mode
                })
            )
        )
    }
}

module.exports = MainView
