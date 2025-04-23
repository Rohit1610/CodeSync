let ratingsArray = []
for(let i = 800 ; i <= 3500 ; i += 100){
    ratingsArray.push(i);
}

export const  ratings = ratingsArray 

let questionsArray = []
for(let i = 1 ; i <= 10 ; i ++){
    questionsArray.push(i)
}

export const questions = questionsArray

let timeArray = []
for(let i = 30 ; i <= 300 ; i += 30){
    timeArray.push(i);
}

export const time = timeArray

let tagsArray = [
    'dp',
    'graphs',
    'constructive algorithms',
    'number theory',
    'combinatorics',
    'data structures',
    'greedy',
    'sortings',
    'binary search',
    'trees',
    'brute force',
    'implementation',
    'two pointers',
    'strings',
    'math',
    'bitmasks',
    'dsu',
    'geometry',
    'dfs and similar',
    'divide and conquer',
    'interactive',
    'games',
    'probabilities',
    'shortest paths',
    '2-sat',
    'matrices',
    'hashing',
    'string suffix structures',
    'fft',
    'flows',
    'meet-in-the-middle',
    'graph matchings',
    'schedules',
    'expression parsing',
    'ternary search',
    'chinese remainder theorem',
    '*special', 
  ];

tagsArray.sort()
  

export const tags = tagsArray