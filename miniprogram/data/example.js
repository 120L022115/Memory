import * as dic from "./query.js"
import {dict} from "./dict.js"
console.log(dic.searchWord(dict,"app"))
console.log(dic.searchWord(dict,'a',2))
console.log(dic.searchWord(dict,'app',0))
console.log(dic.searchWord(dict,'appdsaasd',0))