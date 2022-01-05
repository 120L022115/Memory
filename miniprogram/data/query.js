var cannotfind = []
 export var searchWord = function(dict,word,len) { //搜索单词，不给出最多长度len默认最多给10条记录，给非正数则给出全部搜索记录
  if(typeof word !='string') return cannotfind
  if(word == '') return cannotfind
  var f = dict.indexOf(word,0)
  if(f==-1) return cannotfind;
  if(typeof len != 'number') len = 10;
  var b = dict.match(new RegExp("#"+word+".*?#","g"))
  var arr = [],wd,d,p,type,s,lastp,tranall,ts,tran
  for(var i in b){
    if(len>0 && i>=len) break; 
    wd = b[i]//.substring(1,b[i].length-1)
    f = wd.indexOf("[")
    d = wd.indexOf("]")
    tranall = wd.substring(f+1,d)
    ts = tranall.split(" ")
    type = []
    for(var j in ts){
      p = ts[j].indexOf('.')
      type.push([ts[j].substring(0,p)])
      lastp = p
      p = ts[j].indexOf('.',p+1)
      while(p != -1){
        s = ts[j].lastIndexOf(',',p)
        if(s!=-1) type[j].push(ts[j].substring(s+1,p))
        lastp = p
        p = ts[j].indexOf('.',p+1)
      }
    }
    
    for(var j in ts){
      p = ts[j].lastIndexOf(".")
      ts[j] = ts[j].substr(p+1)
    }
    arr.push({
      'index': i,
      'word': wd.substring(1,f),
      'tranall': tranall,
      'tran': ts,
      'typestr': type.join('.,')+".",
      'type': type
    })}
  return arr
}
