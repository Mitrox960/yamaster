// websocket-server/services/game.service.js

// Durée d'un tour en secondes
const TURN_DURATION = 30;
const TURN_END_DURANT = 5;
const DECK_INIT = {
    dices: [
        { id: 1, value: '', locked: true },
        { id: 2, value: '', locked: true },
        { id: 3, value: '', locked: true },
        { id: 4, value: '', locked: true },
        { id: 5, value: '', locked: true },
    ],
    rollsCounter: 1,
    rollsMaximum: 3
};

const GAME_INIT = {
    gameState: {
        currentTurn: 'player:1',
        timer: null,
        player1Score: 0,
        player2Score: 0,
        grid: [],
        choices: {},
        deck: {}
    }
}

const CHOICES_INIT = {
    isDefi: false,
    isSec: false,
    idSelectedChoice: null,
    availableChoices: [],
};

const ALL_COMBINATIONS = [
    { value: 'Brelan1', id: 'brelan1' },
    { value: 'Brelan2', id: 'brelan2' },
    { value: 'Brelan3', id: 'brelan3' },
    { value: 'Brelan4', id: 'brelan4' },
    { value: 'Brelan5', id: 'brelan5' },
    { value: 'Brelan6', id: 'brelan6' },
    { value: 'Full', id: 'full' },
    { value: 'Carré', id: 'carre' },
    { value: 'Yam', id: 'yam' },
    { value: 'Suite', id: 'suite' },
    { value: '≤8', id: 'moinshuit' },
    { value: 'Sec', id: 'sec' },
    { value: 'Défi', id: 'defi' }
];
const GRID_INIT = [
    [
        { viewContent: '1', id: 'brelan1', owner: null, canBeChecked: false },
        { viewContent: '3', id: 'brelan3', owner: null, canBeChecked: false },
        { viewContent: 'Défi', id: 'defi', owner: null, canBeChecked: false },
        { viewContent: '4', id: 'brelan4', owner: null, canBeChecked: false },
        { viewContent: '6', id: 'brelan6', owner: null, canBeChecked: false },
    ],
    [
        { viewContent: '2', id: 'brelan2', owner: null, canBeChecked: false },
        { viewContent: 'Carré', id: 'carre', owner: null, canBeChecked: false },
        { viewContent: 'Sec', id: 'sec', owner: null, canBeChecked: false },
        { viewContent: 'Full', id: 'full', owner: null, canBeChecked: false },
        { viewContent: '5', id: 'brelan5', owner: null, canBeChecked: false },
    ],
    [
        { viewContent: '≤8', id: 'moinshuit', owner: null, canBeChecked: false },
        { viewContent: 'Full', id: 'full', owner: null, canBeChecked: false },
        { viewContent: 'Yam', id: 'yam', owner: null, canBeChecked: false },
        { viewContent: 'Défi', id: 'defi', owner: null, canBeChecked: false },
        { viewContent: 'Suite', id: 'suite', owner: null, canBeChecked: false },
    ],
    [
        { viewContent: '6', id: 'brelan6', owner: null, canBeChecked: false },
        { viewContent: 'Sec', id: 'sec', owner: null, canBeChecked: false },
        { viewContent: 'Suite', id: 'suite', owner: null, canBeChecked: false },
        { viewContent: '≤8', id: 'moinshuit', owner: null, canBeChecked: false },
        { viewContent: '1', id: 'brelan1', owner: null, canBeChecked: false },
    ],
    [
        { viewContent: '3', id: 'brelan3', owner: null, canBeChecked: false },
        { viewContent: '2', id: 'brelan2', owner: null, canBeChecked: false },
        { viewContent: 'Carré', id: 'carre', owner: null, canBeChecked: false },
        { viewContent: '5', id: 'brelan5', owner: null, canBeChecked: false },
        { viewContent: '4', id: 'brelan4', owner: null, canBeChecked: false },
    ]
];

const GameService = {

    init: {
        gameState: () => {
            const game = { ...GAME_INIT };
            game['gameState']['timer'] = TURN_DURATION;
            game['gameState']['deck'] = { ...DECK_INIT };
            game['gameState']['choices'] = { ...CHOICES_INIT };
            game['gameState']['grid'] = [ ...GRID_INIT];
            return game;
        },

        deck: () => {
            return { ...DECK_INIT };
        },
        choices: () => {
            return { ...CHOICES_INIT };
        },

        grid: () => {
            return { ...GRID_INIT };
        }
    },

    send: {
        forPlayer: {
            // Return conditionnaly gameState custom objet for player views
            viewGameState: (playerKey, game) => {
                return {
                    inQueue: false,
                    inGame: true,
                    idPlayer:
                        (playerKey === 'player:1')
                            ? game.player1Socket.id
                            : game.player2Socket.id,
                    idOpponent:
                        (playerKey === 'player:1')
                            ? game.player2Socket.id
                            : game.player1Socket.id
                };
            },

            viewQueueState: () => {
                return {
                    inQueue: true,
                    inGame: false,
                };
            },
            
            viewLeaveQueueState: () => {
                return {
                    inQueue: false,
                    inGame: false,
                };
            },
            gameTimer: (playerKey, gameState) => {
                // Selon la clé du joueur on adapte la réponse (player / opponent)
                const playerTimer = gameState.currentTurn === playerKey ? gameState.timer : 0;
                const opponentTimer = gameState.currentTurn === playerKey ? 0 : gameState.timer;
                return { playerTimer: playerTimer, opponentTimer: opponentTimer };
            },

            deckViewState: (playerKey, gameState) => {
                const deckViewState = {
                    displayPlayerDeck: gameState.currentTurn === playerKey,
                    displayOpponentDeck: gameState.currentTurn !== playerKey,
                    displayRollButton: gameState.deck.rollsCounter <= gameState.deck.rollsMaximum,
                    rollsCounter: gameState.deck.rollsCounter,
                    rollsMaximum: gameState.deck.rollsMaximum,
                    dices: gameState.deck.dices
                };
                return deckViewState;
            },
            
            choicesViewState: (playerKey, gameState) => {
                const choicesViewState = {
                    displayChoices: true,
                    canMakeChoice: playerKey === gameState.currentTurn,
                    idSelectedChoice: gameState.choices.idSelectedChoice,
                    availableChoices: gameState.choices.availableChoices
                }
                return choicesViewState;
            },

            gridViewState: (playerKey, gameState) => {

                return {
                    displayGrid: true,
                    canSelectCells: (playerKey === gameState.currentTurn) && (gameState.choices.availableChoices.length > 0),
                    grid: gameState.grid
                };

            }
        }
    },

    choices: {
        findCombinations: (dices, isDefi, isSec) => {
            const availableCombinations = [];
            const allCombinations = ALL_COMBINATIONS;

            const counts = Array(7).fill(0); // Tableau pour compter le nombre de dés de chaque valeur (de 1 à 6)
            let hasPair = false; // Pour vérifier si une paire est présente
            let threeOfAKindValue = null; // Stocker la valeur du brelan
            let hasThreeOfAKind = false; // Pour vérifier si un brelan est présent
            let hasFourOfAKind = false; // Pour vérifier si un carré est présent
            let hasFiveOfAKind = false; // Pour vérifier si un Yam est présent
            let hasStraight = false; // Pour vérifier si une suite est présente
            let sum = 0; // Somme des valeurs des dés

            // Compter le nombre de dés de chaque valeur et calculer la somme
            for (let i = 0; i < dices.length; i++) {
                const diceValue = parseInt(dices[i].value);
                counts[diceValue]++;
                sum += diceValue;
            }

            // Vérifier les combinaisons possibles
            for (let i = 1; i <= 6; i++) {
                if (counts[i] === 2) {
                    hasPair = true;
                } else if (counts[i] === 3) {
                    threeOfAKindValue = i;
                    hasThreeOfAKind = true;
                } else if (counts[i] === 4) {
                    threeOfAKindValue = i;
                    hasThreeOfAKind = true;
                    hasFourOfAKind = true;
                } else if (counts[i] === 5) {
                    threeOfAKindValue = i;
                    hasThreeOfAKind = true;
                    hasFourOfAKind = true;
                    hasFiveOfAKind = true;
                }
            }

            const sortedValues = dices.map(dice => parseInt(dice.value)).sort((a, b) => a - b); // Trie les valeurs de dé

            // Vérifie si les valeurs triées forment une suite
            hasStraight = sortedValues.every((value, index) => index === 0 || value === sortedValues[index - 1] + 1);

            // Vérifier si la somme ne dépasse pas 8
            const isLessThanEqual8 = sum <= 8;

            // Retourner les combinaisons possibles via leur ID
            allCombinations.forEach(combination => {
                if (
                    (combination.id.includes('brelan') && hasThreeOfAKind && parseInt(combination.id.slice(-1)) === threeOfAKindValue) ||
                    (combination.id === 'full' && hasPair && hasThreeOfAKind) ||
                    (combination.id === 'carre' && hasFourOfAKind) ||
                    (combination.id === 'yam' && hasFiveOfAKind) ||
                    (combination.id === 'suite' && hasStraight) ||
                    (combination.id === 'moinshuit' && isLessThanEqual8) ||
                    (combination.id === 'defi' && isDefi)
                ) {
                    availableCombinations.push(combination);
                }
            });
        
            const notOnlyBrelan = availableCombinations.some(combination => !combination.id.includes('brelan'));

            if (isSec && availableCombinations.length > 0 && notOnlyBrelan) {
                availableCombinations.push(allCombinations.find(combination => combination.id === 'sec'));
            }

            return availableCombinations;
        }
    },

    grid: {

        resetcanBeCheckedCells: (grid) => {
            const updatedGrid = // TODO

            // La grille retournée doit avoir le flag 'canBeChecked' de toutes les cases de la 'grid' à 'false'

            return updatedGrid;
        },

        updateGridAfterSelectingChoice: (idSelectedChoice, grid) => {

            const updatedGrid = // TODO

            // La grille retournée doit avoir toutes les 'cells' qui ont le même 'id' que le 'idSelectedChoice' à 'canBeChecked: true'

            return updatedGrid;
        },

        selectCell: (idCell, rowIndex, cellIndex, currentTurn, grid) => {
            const updatedGrid = // TODO

            // La grille retournée doit avoir avoir la case selectionnée par le joueur du tour en cours à 'owner: currentTurn'
            // Nous avons besoin de rowIndex et cellIndex pour différencier les deux combinaisons similaires du plateau

            return updatedGrid;
        },

    timer: {
        getTurnDuration: () => {
            return TURN_DURATION;
        },
        getEndTurnDuration: () => {
            return TURN_END_DURANT
        }
    }, 
   
    

    utils: {
        // Return game index in global games array by id
        findGameIndexById: (games, idGame) => {
            for (let i = 0; i < games.length; i++) {
                if (games[i].idGame === idGame) {
                    return i; // Retourne l'index du jeu si le socket est trouvé
                }
            }
            return -1;
        },

    

        findGameIndexBySocketId: (games, socketId) => {
            for (let i = 0; i < games.length; i++) {
                if (games[i].player1Socket.id === socketId || games[i].player2Socket.id === socketId) {
                    return i; // Retourne l'index du jeu si le socket est trouvé
                }
            }
            return -1;
        },

        findDiceIndexByDiceId: (dices, idDice) => {
            for (let i = 0; i < dices.length; i++) {
                if (dices[i].id === idDice) {
                    return i; // Retourne l'index du jeu si le socket est trouvé
                }
            }
            return -1;
        }
    }
}

module.exports = GameService;
