// declarar arreglo

var frutas =["UVA",'PERA','MANZA','BANANA'];
//acceder a los valores
//console.log(frutas[2]);

//agregar elementos
frutas.push('KIWI');
frutas.unshift('FRESA');
//frutas[3]='MANZANA';
frutas.pop();
frutas.shift()
var frutas.forEach=frutas.forEach(function(fruta){
    return(fruta)
    console.log(fruta);
});
    console.log("-----------------------------------------");

var frutasMap =frutas.map(function(fruta){
    return fruta.toUpperCase();
})


console.log(frutas);
console.log(frutasMap);