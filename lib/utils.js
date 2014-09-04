/**
 * Created by Administrator on 2014/9/2.
 */
function evaluate(obj, replace, ignore){
    var regexp = /\{([a-zA-Z0-9_-]+)\}/gi;
    for(var k in obj){
        if(obj.hasOwnProperty(k) && (!ignore || !ignore(k))){
            var val = obj[k];
            if(regexp.test(val)){
                obj[k] = val.replace(regexp,replace)
            }
        }
    }
    return obj;
}
function selfEvaluate(obj,ignore){
    return evaluate(obj,function(str, p1){
        return obj[p1];
    },ignore);
}