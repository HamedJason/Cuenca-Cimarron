const ink = '#3b2314';
export const green = '#00723f';
const white = '#fffaf0';
const yellow = '#febe10';
const blue = '#20419a';
const drop = 'M0 -29C8 -16 21 -4 21 9A21 21 0 0 1 -21 9C-21 -4 -8 -16 0 -29Z';
const fillPath = (d, fill) => `<path d="${d}" fill="${fill}"/>`;
const path = (d, fill = 'none', width = 11, color = ink) =>
  `<path d="${d}" fill="${fill}" stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"/>`;
const oval = (x,y,rx,ry,fill,stroke = 'none',width = 8) =>
  `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${fill}" stroke="${stroke}" stroke-width="${width}"/>`;
const rect = (x,y,w,h,r,fill,stroke = 'none',width = 9) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${width}"/>`;
const move = (x,y,art,scale=1) => `<g transform="translate(${x} ${y}) scale(${scale})">${art}</g>`;
const mirror = art => art + `<g transform="translate(1024 0) scale(-1 1)">${art}</g>`;
const star = (x,y,s,c) => move(x,y,fillPath('M0-18Q4-4 18 0Q4 4 0 18Q-4 4-18 0Q-4-4 0-18Z',c),s);
const heart = (x,y,s,c) => move(x,y,fillPath('M-23-15H-8V-9H8V-15H23V-8H30V7H23V15H15V23H7V31H-7V23H-15V15H-23V7H-30V-8H-23Z',c),s);

export const anchors = {
  coronilla:[512,173], ojos:[512,318], hocico:[512,388], cuello:[512,472],
  pecho:[512,587], espalda:[512,585], manoDerecha:[305,688], cintura:[512,708],
  pies:[[425,960],[599,960]]
};
export const palette = {
  caramelo:['Caramelo','#ffb36e','#e98646','#ffedc9'],
  cobalto:['Azul cobalto','#76ace6','#4c76b2','#fae2b8','Épico'],
  arena:['Arena','#f1cf9c','#d3a574','#fff3db'],
  canela:['Canela','#d18455','#a75c3a','#ffe2b7'],
  piedra:['Gris piedra','#b3aeae','#807c87','#f0e6da'],
  chocolate:['Chocolate','#9d6245','#75402e','#f2ce9d'],
  nieve:['Blanco nieve','#fff9ef','#d7dedb','#fff2cf'],
  menta:['Menta','#a9dec0','#6cbca4','#e7f7d8','Legendario'],
  lila:['Lila','#c9b4ed','#9d83ca','#f5e5fd','Secreto']
};
export const hornColors = {
  ocre:['Ocre','#ffb300','#d77c10','#ffea9a'],
  plata:['Plata','#d7e0eb','#929fb8','#ffffff','Raro'],
  dorado:['Dorado','#ffe055','#db9a09','#fff6cf','Épico'],
  arcoiris:['Arcoíris','#f0a8d7','#b87fca','#fff1ae','Legendario']
};
const arm = (fur,shade) => path('M402 479Q369 461 344 499Q319 536 306 597L282 648Q257 641 255 655Q252 666 273 677Q248 671 248 685Q249 697 272 700Q250 699 257 712Q265 723 287 720Q272 730 286 737Q313 752 333 730Q346 712 347 683L383 617Q414 551 423 515Q429 490 402 479Z',fur)
  + fillPath('M270 710Q310 733 325 694L363 611L384 540L405 529Q406 550 375 614L341 681Q340 718 324 731Q307 745 286 733Q283 731 290 723Z',shade)
  + path('M280 674Q294 676 299 687M301 651Q317 653 323 665','none',5);
const leg = (fur,shade) => path('M391 683Q381 738 389 784L390 869Q370 884 364 914Q360 940 383 950Q421 958 465 946Q479 943 478 922L469 859L488 740Z',fur)
  + fillPath('M462 762L438 851L446 911L464 927L472 922L464 860L480 756Z',shade)
  + path('M388 878Q431 890 472 877L478 920Q480 947 460 950Q422 958 383 950Q357 944 364 915Q369 894 388 878Z','#76442e')
  + fillPath('M372 930Q416 944 470 931Q469 950 435 949L391 948Q375 948 372 930Z','#512a20')
  + path('M421 921L422 948','none',7);
const trunk = (fur,shade,light) => path('M438 429Q466 409 512 414Q560 413 586 429Q634 449 642 511Q639 566 632 637Q654 689 629 723Q609 757 551 765L512 744L473 765Q415 757 395 723Q370 689 392 637Q385 565 382 511Q390 449 438 429Z',fur)
  + fillPath('M598 453Q639 480 636 524L625 636Q647 691 625 717Q601 747 552 758L512 737Q597 732 598 678L588 596Q605 533 598 453Z',shade)
  + oval(510,594,83,112,light);
const head = (fur,shade) => mirror(path('M397 249Q335 201 267 229Q278 283 315 308Q348 328 392 302Z',fur)
  + fillPath('M278 239Q337 240 375 278Q349 308 321 291Q293 274 278 239Z','#cb734e'))
  + path('M358 272Q355 229 395 213Q427 177 474 177L466 154Q498 158 521 176Q547 153 577 162L566 184Q615 189 642 219Q669 237 666 275Q693 303 681 349Q677 392 648 420Q618 469 512 474Q406 469 376 420Q347 392 343 349Q331 303 358 272Z',fur)
  + fillPath('M646 249Q673 275 669 283Q690 316 675 353Q676 391 642 420Q609 465 512 469Q434 468 400 443Q489 467 558 439Q624 414 640 365Q658 309 646 249Z',shade);
const muzzle = light => path('M476 365Q512 379 548 365Q579 355 599 373Q618 388 605 407Q600 443 557 455Q512 467 467 455Q424 443 419 407Q406 388 425 373Q445 355 476 365Z',light,8)
  + fillPath('M479 377Q495 369 512 375Q529 369 545 377Q551 390 527 402Q512 410 497 402Q473 390 479 377Z',ink)
  + oval(504,382,11,4,'#a97050');
const openEyes = (ry, iris) => mirror(oval(451,321,28,ry,white,ink,8)
  + oval(457,325,14,ry-6,iris)
  + oval(452,317,6,8,'#ffffff'));
const brows = (angled=false) => mirror(path(angled?'M423 286L477 302':'M423 283Q446 263 476 279','none',10));

const hornShape = {
  enrollados:['M411 224Q400 152 344 125Q290 94 244 132Q194 172 185 239Q175 314 225 352Q271 388 310 354Q338 330 329 298Q321 273 301 269Q312 296 294 309Q270 328 252 304Q227 270 254 224Q278 190 305 206Q325 220 337 258Z','M192 257Q205 317 243 339Q274 358 312 331Q303 354 277 363Q222 371 193 316Z','M257 134Q319 118 363 185M218 174Q266 158 303 193M195 224Q225 210 246 230M194 273Q213 261 241 274'],
  cortos:['M394 225Q384 157 331 133Q285 112 246 151Q211 189 219 245Q227 289 274 295Q316 301 342 260Q308 274 292 251Q273 220 304 201Q325 187 348 235Z','M222 229Q249 283 305 273Q280 303 251 284Q228 269 222 229Z','M253 153Q300 144 342 176M225 201Q257 183 289 208'],
  espiral:['M420 216Q407 131 343 107Q266 75 212 130Q160 182 164 272Q169 360 238 385Q307 408 339 347Q356 307 328 279Q309 260 293 277Q283 289 292 301Q304 286 310 304Q314 322 298 334Q271 352 242 326Q210 293 228 242Q243 194 278 184Q312 175 337 222L351 258Z','M172 250Q185 339 237 363Q297 384 331 337Q317 389 264 387Q189 385 172 302Z','M224 124Q282 102 338 146M184 177Q232 158 269 185M171 233Q200 213 232 230M173 289Q191 273 221 280']
};
function horns(shape, tones) {
  const [base,shadow,ridges]=hornShape[shape];
  const [,color,dark,light]=tones;
  const rainbow = tones===hornColors.arcoiris;
  const bands = rainbow ? ridges.split(/(?=M)/).map((segment,i)=>
    path(segment,'none',14,['#ffe088','#e9859d','#b3e0b0','#88bedf'][i])).join('') : '';
  return mirror(path(base,color,13)+fillPath(shadow,dark)+path(ridges,'none',rainbow?21:7)+bands
    +path('M255 145Q279 135 301 143','none',8,light));
}

const choices = {};
function group(id,name,icon,view,empty) {
  choices[id]={id,name,icon,view,items:empty?[{id:'ninguno',name:empty,art:''}]:[]};
}
function add(group,id,name,art,rarity='Común',extra={}) {
  choices[group].items.push({id,name,art,rarity,...extra});
}
group('pelaje','Pelaje','fur','330 165 364 320');
for(const [id,[name,color,,,rarity]] of Object.entries(palette)) add('pelaje',id,name,'',rarity,{swatch:color});
group('cuernos','Cuernos','horns','155 88 715 305');
for(const [id,name] of Object.entries({enrollados:'Enrollados',cortos:'Cortos',espiral:'Espiral grande'})) add('cuernos',id,name,horns(id,hornColors.ocre),id==='espiral'?'Raro':'Común');
group('color-cuernos','Color de cuernos','horns','155 88 715 305');
for(const [id,tones] of Object.entries(hornColors)) add('color-cuernos',id,tones[0],horns('enrollados',tones),tones[4]);
group('ojos','Ojos','eyes','405 258 214 111');
add('ojos','redondos','Redondos',brows()+openEyes(37,ink));
add('ojos','alegres','Alegres',brows()+mirror(path('M425 328Q450 294 475 328','none',11)));
add('ojos','decididos','Decididos',brows(true)+openEyes(30,ink));
add('ojos','sorprendidos','Sorprendidos',mirror(path('M425 268Q449 248 472 269','none',9))+openEyes(43,ink));
group('boca','Boca','mouth','425 392 174 69');
add('boca','sonrisa','Sonrisa',path('M463 414Q511 452 560 411','none',9));
const laugh = path('M452 407Q513 431 573 405Q553 457 510 454Q471 455 452 407Z','#743123',8)
  +fillPath('M460 412Q512 427 566 410Q556 431 513 431Q475 429 460 412Z',white)
  +fillPath('M488 448Q510 432 537 442Q520 457 488 448Z','#f58374');
add('boca','risa','Risa abierta',laugh);
add('boca','lengua','Lengua de fuera',path('M464 411Q513 434 558 410Q546 442 513 443Q483 443 464 411Z','#6e3227',8)+path('M514 425H542V442Q540 464 527 465Q513 465 513 442Z','#f78680',6));
add('boca','sorpresa','¡Oh!',oval(512,429,20,24,'#6e3227',ink,7)+oval(513,441,11,7,'#ed7b6d'));
group('marcas','Marcas','spark','351 287 330 110','Sin marcas');
add('marcas','pecas','Pecas',mirror([ [394,345],[410,353],[389,362] ].map(([x,y])=>oval(x,y,4.4,4.4,'#9b5132')).join('')));
add('marcas','mancha','Mancha en el ojo',fillPath('M416 275Q443 255 477 276Q499 294 486 335Q474 366 435 355Q400 346 404 308Z','#b37151'));
add('marcas','rubor','Rubor',mirror(oval(397,358,22,11,'#ef9383')));
add('marcas','tormenta','Rayo de tormenta',fillPath('M622 335L601 360H619L607 380L644 351H625L636 335Z',blue),'Raro');

group('cabeza','Sombreros y cascos','helmet','254 22 518 405','Sin sombrero');
const capBrim = 'M329 218Q513 180 682 207Q730 218 720 243Q704 260 651 255Q509 228 362 273Q327 277 312 255Q300 233 329 218Z';
add('cabeza','casco-verde','Casco de brigadista',path('M348 220Q349 139 411 112L451 94Q470 73 509 73Q553 72 572 95Q671 117 680 215Z',green,13)
  +fillPath('M496 81Q550 73 570 99Q656 119 675 210L618 206Q600 131 546 104Q526 88 496 81Z','#005332')
  +path('M419 209Q431 134 464 107M575 209Q568 140 542 108','none',9)
  +path('M371 192Q378 154 407 138','none',9,'#6acf8d')
  +move(509,158,path(drop,white,5),1.07)+path(capBrim,'#078447',13)
  +path('M344 240Q511 204 664 228','none',7,'#5aba7d'));
add('cabeza','gorra','Gorra cimarrona',path('M353 228Q347 150 406 125Q507 78 598 128Q635 149 643 213L711 237Q727 250 712 263Q680 279 622 264L565 247Q442 250 353 249Z','#078249',12)
  +path('M566 247Q609 224 643 213M436 224Q449 136 510 117','none',8)
  +move(519,180,fillPath(drop,white),.82));
add('cabeza','gorro','Gorro de lana',oval(511,83,38,36,'#ffca54',ink,10)
  +path('M345 228Q346 112 464 111H558Q664 122 676 225Z','#274997',12)
  +path('M426 215Q428 147 468 118M505 211V115M581 216Q579 147 548 118','none',8,'#617fce')
  +path('M342 213Q501 183 677 213L683 250Q512 224 336 250Z','#5277c7',11));
add('cabeza','capucha','Capucha de lluvia',path('M367 339Q323 284 338 220Q355 123 447 95Q511 60 578 95Q668 125 686 218Q701 282 658 339L643 286Q662 228 620 189Q580 147 512 151Q444 147 403 189Q362 230 381 286Z',yellow,13)
  +path('M367 243Q372 156 457 125','none',8,'#fff1a8'),'Raro');
add('cabeza','paja','Sombrero de paja',path('M383 211L404 117Q505 77 616 117L641 209Z','#f8ce77',11)
  +path('M390 174Q513 150 632 174L640 212H384Z',green,9)
  +path('M275 221Q482 169 699 205Q759 218 749 241Q737 272 619 273Q447 267 314 279Q282 281 269 258Q258 243 275 221Z','#f5c86b',12)
  +path('M301 244Q516 211 715 237','none',7,'#bd8442'));
add('cabeza','birrete','Birrete',path('M398 168H623L618 234Q510 207 402 234Z','#214763',10)
  +path('M291 157L511 78L733 156L512 217Z','#326580',12)+path('M512 155L688 165V222','none',9,'#ffcd51')
  +path('M681 215H695L702 251H675Z','#ffcd51',6),'Épico');
add('cabeza','vaquero','Sombrero vaquero',path('M366 212L396 112Q424 77 468 119Q510 158 559 119Q609 77 630 120L655 213Z','#d99455',11)
  +path('M371 184Q507 158 650 183L658 217H365Z','#754332',9)
  +path('M298 200Q346 220 434 193Q512 171 591 193Q677 220 726 199Q754 190 748 217Q726 267 670 270Q514 223 353 272Q300 274 275 220Q269 191 298 200Z','#ecb175',12),'Raro');
add('cabeza','corona','Corona de cartón',path('M383 214L367 121L445 150L512 86L579 150L657 121L641 214Q511 190 383 214Z',yellow,12)
  +path('M390 191Q513 170 634 192','none',7,'#bc7e10')
  +oval(512,152,13,16,'#fff4be',ink,5),'Épico');
add('cabeza','mago','Gorro de mago',path('M383 217Q412 153 457 92Q512 12 588 41L550 80L644 217Z','#6d52a7',12)+star(516,112,1.1,'#ffd366')+star(482,174,.72,'#ffd366')+star(569,164,.86,'#ffd366')
  +path('M315 216Q506 175 709 213Q735 221 727 239Q713 261 658 256Q507 227 362 263Q331 265 309 249Q293 231 315 216Z','#8865bd',12),'Secreto');
add('cabeza','gorra-invertida','Gorra al revés',path('M347 211Q340 153 397 119Q504 65 609 123Q675 154 678 228Q574 207 539 223Q530 180 497 184Q465 185 456 230Q389 238 346 236L287 259Q270 252 283 233Z','#7f567b',12)+path('M560 207Q542 143 499 103M347 211Q395 203 431 206','none',8,'#c18da7'));
add('cabeza','bombero','Casco de bombero',path('M344 220Q347 102 495 94Q657 91 679 219Z','#cc5738',12)
  +fillPath('M510 101Q654 105 673 218L614 218Q587 135 510 101Z','#aa332c')
  +path(capBrim,'#ed7951',12)+path('M484 125H540L548 181L512 206L476 181Z','#fee09a',8)+move(512,165,fillPath(drop,'#cb573a'),.56),'Raro');
add('cabeza','astronauta','Casco de astronauta',path('M349 398Q309 345 322 244Q331 108 512 93Q693 108 702 244Q715 345 675 398L628 415Q688 337 676 260Q665 121 512 121Q359 121 348 260Q336 337 396 415Z','#c2e3e2',11)
  +mirror(path('M329 268H360V370H329Z','#e9f4ed',9)+path('M362 223Q386 159 430 141','none',11,'#fff'))
  +path('M376 417Q513 444 648 417L642 451Q510 473 382 448Z','#8cabc3',10),'Legendario');
add('cabeza','chef','Gorro de chef',path('M407 229L392 161Q343 154 337 118Q335 72 395 67Q412 29 468 44Q513 5 561 44Q620 28 639 70Q697 72 688 118Q683 151 631 162L619 230Q508 208 407 229Z','#fff5df',12)
  +path('M400 193Q511 172 625 194M431 151L441 183M586 151L577 182','none',8,'#d4ab8c'),'Raro');
add('cabeza','hojas','Corona de hojas',mirror(path('M512 223Q423 178 342 220','none',19,'#4f7844')
  +path('M396 210Q352 180 355 130Q414 140 422 201ZM451 204Q411 161 435 113Q485 150 475 208Z','#73a851',9)
  +path('M400 201L377 160M460 196L449 144','none',6,'#dce79d'))+move(512,207,fillPath(drop,'#e3c566'),.6),'Raro');
add('cabeza','audifonos','Audífonos gamer',path('M365 289V220Q369 111 512 113Q655 111 659 220V289','none',26,'#363246')
  +path('M392 177Q428 120 512 125Q596 120 632 177','none',11,'#a899dc')
  +mirror(rect(340,261,47,83,17,'#635491',ink,10)+rect(349,279,15,46,7,'#94e4c4')),'Épico');
add('cabeza','bloques','Gorro de bloques',path('M355 231V179H382V122H444V90H580V122H642V179H669V231Z','#76ab55',11)
  +fillPath('M580 121H640V180H665V226H555V175H580Z','#47774d')
  +rect(438,134,67,52,0,'#98c46f')+rect(468,140,35,21,0,'#c6d992'),'Secreto');
add('cabeza','hongo','Sombrero de hongo',path('M317 219Q318 148 375 109Q430 47 512 45Q605 52 652 116Q704 158 706 220Q663 255 512 243Q361 255 317 219Z','#bc5761',12)
  +path('M317 219Q499 190 706 220Q665 261 513 242Q364 252 317 219Z','#ffe4b5',9)
  +oval(502,112,45,29,'#ffe8bd')+oval(398,169,32,20,'#ffe8bd')+oval(621,174,31,20,'#ffe8bd'),'Secreto');
add('cabeza','caballero','Casco de caballero de juguete',path('M507 109Q490 46 560 29Q605 15 621 39Q562 44 551 103Z','#d37d83',9)
  +path('M362 226Q355 100 510 92Q668 103 662 226L633 261Q515 238 391 261Z','#a9b9c0',12)
  +path('M371 223L653 223L623 282Q514 261 404 282Z','#d7e3df',10)
  +[433,472,512,552,591].map(x=>path(`M${x} 241v17`,'none',6)).join(''),'Épico');

group('cara','Cara','glasses','365 265 295 175','Sin accesorio');
const glasses = (lens,color=ink) => path('M474 318Q512 290 550 318M407 307L366 292M617 307L658 292','none',10,color)
  + mirror(oval(438,320,42,39,lens,color,10));
add('cara','redondos','Lentes redondos',glasses('none'));
add('cara','sol','Lentes de sol',glasses('#263b44')+mirror(path('M417 306L440 293','none',6,'#88a9a7')));
add('cara','pixel','Lentes pixel',path('M376 288H648V313H630V344H606V361H554V346H534V313H490V346H470V361H418V344H394V313H376Z','#28262a',7)
  +mirror(path('M414 306H431V321H448V337','none',7,white)),'Raro');
add('cara','goggles','Goggles',glasses('none',blue)+mirror(path('M403 301Q436 268 473 300','none',10,'#78d2db')),'Raro');
add('cara','antifaz','Antifaz de héroe',path('M371 283Q430 272 512 297Q593 273 653 283L641 341Q611 376 566 365Q536 358 512 332Q488 359 458 365Q411 377 383 342Z','#8162ab',10)
  +mirror(oval(442,321,30,22,white,ink,6)+oval(452,321,12,15,ink)+oval(448,316,4,5,'#fff')),'Raro');
add('cara','cubrebocas','Cubrebocas de gotas',path('M415 382L360 354M609 382L664 354','none',8,blue)
  +path('M420 375Q513 398 604 375L603 436Q510 468 421 436Z','#9ed9ec',8)+move(512,418,fillPath(drop,blue),.5)+path('M448 405L477 411M548 411L577 405M448 423L476 430M548 430L577 423','none',4,'#609ab5'));
add('cara','gala','Monóculo y bigote',oval(572,319,37,39,'none','#ac6b21',9)+path('M606 328Q637 374 611 409','none',6,'#ac6b21')
  +fillPath('M511 407Q493 378 460 398Q441 414 422 402Q428 440 469 433Q498 429 512 417Q526 429 555 433Q596 440 602 402Q583 414 564 398Q531 378 513 407Z',ink),'Épico');
add('cara','lucha','Máscara de lucha libre',path('M374 270Q419 221 512 228Q605 221 650 270Q679 303 664 350L644 408Q611 429 598 409L608 383Q582 353 541 370L512 394L483 370Q442 353 416 383L426 409Q414 429 380 408L360 350Q345 304 374 270Z',green,9)
  +mirror(path('M382 303Q433 266 490 303L494 337Q433 368 384 339Z',yellow,7)
  +oval(445,321,26,28,white,ink,6)+oval(451,323,11,17,ink)+oval(447,315,4,6,'#fff'))
  +move(512,264,fillPath(drop,white),.64),'Épico');

group('torso','Ropa','shirt','312 440 400 330','Sin playera');
const shirt = (color,shade) => path('M419 449L365 475L320 537L373 569L391 548L383 692Q443 743 512 735Q581 743 641 692L633 548L651 569L704 537L659 475L605 449Q580 475 512 475Q444 475 419 449Z',color,12)
  +fillPath('M632 548L650 566L693 540L648 518L607 504L613 691Q590 711 549 728Q595 724 632 689Z',shade)
  +path('M436 461Q511 500 588 461','none',8);
add('torso','verde','Playera verde',shirt(green,'#005632'));
add('torso','lluvia','Impermeable amarillo',shirt(yellow,'#dc9516')+path('M512 491V727M411 619L464 609M559 609L612 619','none',10)+[530,576,623,670].map(y=>oval(531,y,5.5,5.5,ink)).join(''),'Raro');
add('torso','mezclilla','Chamarra de mezclilla',shirt('#527eac','#3d5b83')+path('M510 491V729M411 535H468V575H411ZM556 535H613V575H556Z','none',8)+[520,571,622,674].map(y=>oval(526,y,5,5,'#ffe5a0')).join(''),'Raro');
add('torso','sudadera','Sudadera verde',shirt('#29866d','#09624f')+path('M453 479L447 555M571 479L577 555M466 624H558L580 675H444Z','none',8)+move(512,559,fillPath(drop,white),.8));
add('torso','futbol','Camiseta de fútbol',shirt('#c34c3e','#96352e')+path('M411 507Q513 561 613 507M398 578Q514 627 626 578','none',19,'#f3bc89'));
add('torso','cientifico','Bata de exploración',shirt('#f3eee4','#c8d6d7')+path('M446 464L486 541L510 511L534 541L578 464M512 536V729M552 578H613V625H552Z','none',8)+move(581,598,fillPath(drop,blue),.37),'Épico');
add('torso','pixel','Playera corazón pixel',shirt('#61469a','#473478')+heart(512,561,1.8,'#ff9f91'),'Raro');
add('torso','espacial','Traje espacial',shirt('#f5f7f1','#bac9d6')+rect(456,544,112,90,15,'#6485aa',ink)+rect(473,559,77,29,5,'#bae4dc',ink,5)
  +oval(488,611,6,6,yellow)+oval(512,611,6,6,'#ee8174')+oval(536,611,6,6,'#e8f7f2'),'Legendario');
add('torso','overol','Overol de explorador',shirt('#d8b974','#ad9254')+path('M402 467L439 450L473 548H551L585 450L622 467L593 564L630 688Q512 755 394 688L431 564Z','#5a7b66',10)+rect(465,573,94,58,10,'#76977c',ink,7)+mirror(oval(451,559,9,9,yellow,ink,4)),'Raro');
add('torso','navidad','Suéter navideño',shirt('#ad4951','#843b45')+path('M352 534L383 544M400 576H625M392 659H631M643 548L672 535','none',13,'#f3dfb0')+[436,512,588].map((x,i)=>star(x,619,i===1?1.55:1,'#f3dfb0')).join(''),'Épico',{unlock:'Temporada navideña.'});
add('torso','calabaza','Disfraz de calabaza',shirt('#709857','#4a774c')+path('M388 613Q382 522 458 520Q511 496 566 520Q643 522 636 613Q654 720 559 735Q511 749 465 735Q372 719 388 613Z','#ec943f',11)+path('M451 526Q416 610 462 725M570 527Q605 610 562 725','none',8,'#be642d')+mirror(fillPath('M430 635L468 581L492 635Z',ink))+fillPath('M450 654Q514 669 574 651Q548 699 512 700Q474 699 450 654Z',ink),'Épico',{unlock:'Temporada de otoño.'});
group('chaleco','Chaleco','vest','368 438 288 311','Sin chaleco');
const vest = (color,shade,bands) => path('M419 449L455 455L492 525L492 737Q435 745 378 714L390 541Z',color,11)
  +fillPath('M426 462L455 462Q479 490 486 528L486 731L467 731V555Q464 521 426 462Z',shade)
  +path('M422 472Q452 512 456 557V726L427 720V555Q421 515 408 495Z',bands,4)
  +path('M387 636Q429 650 492 650V683Q434 683 383 664Z',bands,4);
add('chaleco','brigadista','Chaleco reflejante',mirror(vest(yellow,'#e69c0e','#fff6d9')));
add('chaleco','rescate','Chaleco naranja',mirror(vest('#f1854d','#d95f34','#fff6d9')),'Raro');

group('espalda','Espalda','backpack','164 420 696 435','Sin accesorio');
const pack = path('M330 474Q329 428 389 420H634Q696 428 694 474L727 719Q717 779 655 780H369Q307 779 297 719Z','#315c47',12)
  +rect(311,523,113,198,30,'#52805c',ink)+rect(600,523,113,198,30,'#52805c',ink)
  +path('M384 481Q397 419 450 420H574Q628 420 640 481','none',25,'#e6ac43');
add('espalda','mochila','Mochila de emergencia',pack,'Raro',{unlock:'Completar la actividad de la mochila de emergencia.'});
add('espalda','capa','Capa de héroe',path('M420 443Q514 471 604 443Q617 521 723 652Q760 704 799 797Q736 823 666 807Q590 836 512 798Q434 836 358 807Q288 823 225 797Q264 704 301 652Q407 521 420 443Z','#a74857',12)
  +mirror(path('M421 498Q387 647 303 772','none',14,'#da6970')),'Raro');
add('espalda','nube','Capa de nube',path('M422 440Q514 475 601 440Q643 566 790 737Q838 766 813 803Q792 827 753 814Q727 850 680 826Q638 850 599 823Q512 866 425 823Q381 851 343 826Q298 850 273 814Q231 828 211 803Q186 766 235 737Q383 564 422 440Z','#b7dce4',12)
  +mirror(move(280,767,fillPath(drop,'#508bb2'),.7)+move(358,799,fillPath(drop,'#508bb2'),.55)),'Épico');
add('espalda','monarca','Alas de monarca',mirror(path('M465 620Q353 420 230 416Q155 420 181 527Q198 618 322 659Q228 684 256 761Q282 834 362 793Q424 763 465 620Z','#ef883e',15)
  +path('M191 455Q307 489 442 620M198 543Q289 551 418 627M271 746Q346 707 437 650M261 786L360 745','none',11)
  +[ [193,474],[199,508],[218,551],[261,602],[275,748],[296,773],[324,767] ].map(([x,y])=>oval(x,y,8,8,white)).join('')),'Épico');
add('espalda','tanque','Tanque de buzo',mirror(rect(312,451,108,315,48,'#719aae',ink,12)+path('M321 540H407M320 617H419','none',18,'#bed5d9')),'Raro');
add('espalda','jetpack','Cohete de juguete',mirror(path('M348 432Q284 496 299 650L320 691H375L397 648Q407 496 348 432Z','#bcd1d4',12)
  +path('M348 432Q313 470 304 524H393Q383 471 348 432Z','#e2715f',10)+path('M319 692L309 722H386L375 692Z','#687d92',9)
  +fillPath('M332 729Q312 779 348 819Q384 779 364 729Z','#f7b547')),'Legendario');

group('cuello','Cuello','scarf','373 442 278 178','Sin accesorio');
add('cuello','bufanda','Bufanda tejida',path('M405 455Q505 480 612 452L637 497Q575 527 543 518L562 601L508 615L490 526Q447 524 389 493Z','#a55268',10)
  +path('M427 468L417 499M468 479L461 513M513 538L539 530M520 580L551 571','none',9,'#de8995'));
add('cuello','paliacate','Paliacate verde',path('M404 460Q513 482 620 460L624 497Q580 557 512 597Q444 557 400 497Z','#147858',10)
  +path('M427 493Q471 536 512 559Q553 536 597 493','none',8,'#87c78c'));
add('cuello','medalla','Medalla de brigadista',path('M438 453L512 526L586 453L600 474L526 555H498L423 474Z',blue,8)
  +oval(512,564,40,40,'#ffcf52',ink,9)+move(512,564,fillPath(drop,'#967124'),.72),'Épico',{unlock:'Completar el logro de Brigadista.'});
add('cuello','concha','Collar de concha',path('M415 456Q449 542 512 534Q575 542 609 456','none',10)
  +path('M479 548Q469 528 488 524Q496 510 512 522Q528 510 536 524Q555 528 545 548L512 579Z','#f7c9a3',8)
  +path('M492 532L512 568L532 532','none',5,'#ce8664'));
add('cuello','mono','Moño de gala',path('M502 490L443 468V532L502 513H522L581 532V468L522 490Z','#79455d',9)+rect(494,480,36,43,8,'#a75a70',ink,7));

group('mano','En la mano','umbrella','93 434 305 385','Manos libres');
add('mano','paraguas','Paraguas',path('M271 521V738Q271 777 301 777Q330 775 330 746','none',13)
  +path('M118 559Q137 465 268 459Q389 468 414 559Q364 537 317 559Q272 535 224 559Q173 538 118 559Z','#397cba',12)
  +path('M224 554Q227 493 269 462Q307 492 317 554','none',9)
  +path('M269 459V435','none',10)+path('M311 675Q285 664 275 679Q273 689 294 696','none',9),'Raro');
add('mano','linterna','Linterna',move(270,696,`<g transform="rotate(-35)">${path('M-44-80H44L48-47L28-29V52Q27 70 0 70Q-27 70-28 52V-29L-48-47Z','#edb03a',9)+rect(-42,-80,84,25,7,'#fff5c4',ink,8)+rect(-14,-6,28,22,6,'#315745',ink,6)}</g>`));
add('mano','silbato','Silbato',path('M286 686Q245 763 233 735L255 697','none',8,blue)
  +path('M232 664L297 649Q327 663 323 685Q320 716 281 723Q254 724 247 693L226 692Z','#f29351',9)+oval(288,685,16,16,'#bd6136',ink,6));
add('mano','radio','Radio de pilas',path('M299 642L324 573','none',9)+rect(226,631,114,104,15,'#537373',ink)
  +rect(239,646,44,22,4,'#c1e4bd',ink,5)+oval(303,690,21,21,'#273c3b',ink,6)+[684,696,707].map(y=>path(`M241 ${y}H263`,'none',5)).join(''),'Raro');
add('mano','libro','Libro',path('M266 635Q219 605 170 627L182 711Q220 699 279 729Q321 700 358 701L362 610Q310 607 266 635Z','#427b71',10)
  +path('M267 638Q227 615 185 631L194 693Q230 683 277 713Q317 683 345 688L348 623Q314 621 267 638Z',white,7)+path('M267 638L277 710M210 649L248 657M293 653L330 640','none',5));
add('mano','control','Control retro',path('M220 654Q254 639 296 650Q320 657 330 691Q336 717 316 725Q302 730 284 708H250Q231 729 215 722Q193 711 201 690Z','#e4dbcd',9)
  +path('M225 680H248M236 669V691','none',8)+oval(292,676,7,7,'#cb5f66')+oval(306,688,7,7,green),'Raro');
add('mano','planta','Planta en maceta',path('M278 673Q244 633 257 592Q285 608 282 649Q288 608 325 603Q331 636 287 663L287 681Z','#73a854',8)
  +path('M241 671H316L306 722Q278 736 251 722Z','#c97752',8)+rect(233,664,91,22,6,'#e89969',ink,7));
add('mano','globo','Globo',path('M258 591Q249 618 269 648Q293 675 283 727','none',8)+oval(257,515,62,77,'#de7791',ink,10)
  +path('M221 503Q223 471 249 463','none',10,'#ffe1e3')+path('M251 586L241 607H274L262 586Z','#c05d7c',7));
add('mano','pelota','Pelota',oval(257,698,54,54,'#f3d078',ink,9)
  +path('M206 690Q257 641 301 671M223 733Q280 716 301 671M258 646Q247 699 278 747','none',9,'#bb694a'));
add('mano','banderin','Banderín verde',path('M287 748L254 480','none',11)
  +path('M254 491L391 521L265 576Z',green,9)+move(290,535,fillPath(drop,white),.63),'Raro');

group('pies','Calzado','boot','350 776 324 192','Sin calzado');
const boot = (color,shade) => mirror(path('M384 801H476L468 884Q467 903 480 922V943Q477 960 455 960H377Q350 960 349 938Q348 910 385 892Z',color,11)
  +fillPath('M469 808L463 880Q455 902 474 927L473 944L451 953H402Q448 940 446 919L435 893L443 808Z',shade)
  +path('M383 817L475 817M354 935Q390 943 474 935','none',9)+path('M398 836V876','none',8,'#fff1b6'));
add('pies','botas-lluvia','Botas de lluvia',boot(yellow,'#d58e12'));
add('pies','montana','Botas de montaña',boot('#a56e51','#774c3b')+mirror(path('M400 848L442 838M399 870L441 860M397 892L439 882','none',7,'#f2d8a5')),'Raro');
add('pies','tenis','Tenis',mirror(path('M388 875L431 890L468 874L478 926Q486 951 462 960H375Q347 958 348 937Q348 912 381 903Z','#63a88b',11)
  +path('M350 936Q390 947 480 934L478 950L461 960H376Q355 960 350 946Z',white,8)+path('M391 910L431 919M397 894L438 907','none',7,white)));
add('pies','chanclas','Chanclas',mirror(path('M360 929Q384 911 446 914Q478 918 482 938Q492 957 463 960H384Q356 960 355 947Z','#369da1',10)+path('M367 929Q383 904 419 918L449 907','none',13,'#edac50')));

const cloud = (x,y,s,c) => move(x,y,fillPath('M-75 19Q-77-3-46-12Q-42-42-3-40Q23-45 39-14Q69-18 80 5Q87 21 65 24H-56Q-71 23-75 19Z',c),s);
const skyline = (colors) => [ [8,619,70,90],[93,593,90,125],[191,649,89,110],[747,631,79,114],[838,585,94,143],[934,646,73,105] ].map(([x,y,w,h],i)=>rect(x,y,w,h,4,colors[i%colors.length])+fillPath(`M${x-9} ${y}L${x+w/2} ${y-31}L${x+w+9} ${y}Z`,colors[(i+1)%colors.length])+rect(x+20,y+25,18,22,2,'#fff1d0')).join('');
function landscape(type) {
  const coast = type==='playa';
  const arco = type==='tijuana';
  const cerro = type==='cerro';
  const campus = type==='campus';
  const rainbow = type==='arcoiris';
  return rect(0,0,1024,1024,0,coast?'#ccebf0':'#dcebd5')
    + oval(coast?235:788,231,111,111,'#f7d879')
    + cloud(113,258,1.2,'#f0f5e6')+cloud(920,340,.98,'#f0f5e6')+cloud(229,357,.62,'#f0f5e6')
    + (rainbow?['#e38b75','#efbb64','#f4d88b','#94be90','#73aeb4'].map((c,i)=>{
      const radius=451-i*27;
      return path(`M${512-radius} 613A${radius} ${radius} 0 0 1 ${512+radius} 613`,'none',28,c);
    }).join(''):'')
    + fillPath(cerro?'M0 653L143 580L272 452L404 404L598 417L743 503L872 569L1024 500V1024H0Z':'M0 642Q170 430 316 462Q466 464 587 602Q784 405 1024 563V1024H0Z',coast?'#8fbbb1':'#a0bd87')
    + fillPath('M0 715Q180 572 336 608Q523 659 651 616Q860 544 1024 696V1024H0Z',coast?'#70bfc6':'#7da77a')
    + (arco? path('M105 663Q132 488 220 497Q291 500 322 650','none',17,'#fbf4d2')+skyline(['#dcae73','#b6876d','#e5c48a']):'')
    + (campus? rect(707,565,276,152,5,'#e9dc9e')+rect(727,590,236,38,4,'#386f62')+rect(740,648,209,13,3,'#bd9e64')+rect(813,663,66,50,3,'#538d75')+rect(712,551,270,16,4,'#638364'):'')
    + fillPath('M0 802Q251 754 499 792Q743 828 1024 729V1024H0Z',coast?'#efd29c':'#93b882')
    + fillPath('M0 928Q246 856 559 884Q786 911 1024 824V1024H0Z',coast?'#f8e2ad':'#a9c891')
    + (coast?path('M0 765Q182 719 392 755M644 775Q864 761 1024 705','none',10,'#f0f8df'):'')
    + Array.from({length:24},(_,i)=>{const x=28+(i*79)%965,y=800+(i*51)%207;return path(`M${x} ${y}l-6 -11m6 11l7 -14`,'none',4,coast?'#d0ac76':'#6d9969');}).join('');
}
group('fondo','Fondos','landscape','0 0 1024 1024','Transparente');
add('fondo','tijuana','Colonias de Tijuana',landscape('tijuana'));
add('fondo','playa','Playa de Rosarito',landscape('playa'));
add('fondo','cerro','Cerro Colorado',landscape('cerro'));
add('fondo','campus','Campus UABC',landscape('campus'),'Raro');
add('fondo','arcoiris','Cielo con arcoíris',landscape('arcoiris'),'Épico');
group('marco','Marcos','frame','0 0 1024 1024','Sin marco');
const frame = (color,inside) => rect(23,23,978,978,32,'none',color,45)+rect(50,50,924,924,25,'none',inside,8);
add('marco','madera','Marco de madera',frame('#ad7248','#d6a671'));
add('marco','dorado','Marco dorado',frame('#d99224','#ffe183')+star(51,51,1.8,'#fff1b3')+star(973,973,1.8,'#fff1b3'),'Épico');
add('marco','pixel','Marco pixel',rect(20,20,984,984,0,'none','#5c4a8f',40)+[ [44,44],[950,44],[44,950],[950,950] ].map(([x,y])=>rect(x-18,y-18,48,48,0,'#d8b2ef')).join(''),'Raro');
add('marco','nubes','Marco de nubes',frame('#bed9e4','#e4f2ef')+cloud(112,967,1.7,'#eff8f4')+cloud(922,973,1.8,'#eff8f4')+cloud(916,44,1.4,'#eff8f4'),'Raro');
const compass = move(91,91,oval(0,0,47,47,'#f6dea0','#2c7657',10)+fillPath('M-21 21L-9 -9L21 -21L9 9Z','#2c7657')+oval(0,0,4,4,'#fff3ca'));
add('marco','explorador','Marco Explorador',frame('#2c7657','#f6dea0')+compass,'Legendario',{unlock:'Completar el logro de Explorador.'});
group('efecto','Efectos','spark','0 0 1024 1024','Sin efecto');
add('efecto','lluvia','Lluvia suave',Array.from({length:38},(_,i)=>{const x=48+(i*117)%935,y=47+(i*181)%883;return path(`M${x} ${y}l-18 34`,'none',7,i%3?'#9bd1e9':'#e9fbff')}).join(''),'Legendario');
add('efecto','brillo','Brillitos',[[140,303],[800,289],[906,475],[180,742],[846,796],[115,571],[691,120]].map(([x,y],i)=>star(x,y,i%2?1.3:2.1,i%2?'#fff9da':'#f6c64e')).join(''),'Legendario');
add('efecto','corazones','Barra de corazones',[-75,0,75].map((x,i)=>heart(512+x,46,.8,['#ef8a80','#df686a','#f4ac98'][i])).join(''),'Secreto');
add('efecto','aura','Aura de estrellas',Array.from({length:14},(_,i)=>{const a=i*Math.PI/7;return star(Math.round(512+389*Math.sin(a)),Math.round(520+418*Math.cos(a)),i%2?1.25:1.9,i%2?'#c684e4':'#ffe069')}).join(''),'Legendario');
add('efecto','estela','Estela de arcoíris',`<g opacity=".86">${['#e28687','#f6c271','#efe08c','#96cdab','#97c9df','#bda4dc'].map((c,i)=>path(`M${72+i*12} 864Q${100+i*20} 702 ${271+i*9} 757Q${368+i*16} 808 ${400+i*10} 785`,'none',12,c)).join('')}</g>`,'Legendario');

group('pantalon','Pantalones','shirt','348 650 328 277');
function trousers(color,shadow,thread,hem=890,pockets=true) {
  return path(`M394 671Q513 700 630 671Q648 719 642 771L635 ${hem}Q587 ${hem+12} 547 ${hem}L532 797Q529 763 512 763Q495 763 492 797L477 ${hem}Q437 ${hem+12} 389 ${hem}L382 771Q376 719 394 671Z`,color,11)
    + mirror(fillPath(`M470 741Q493 750 492 768L473 ${hem-4}Q459 ${hem} 446 ${hem}L457 786Z`,shadow)
    + path(`M393 ${hem-15}Q435 ${hem-5} 475 ${hem-15}`,'none',5,thread))
    +path('M391 700Q511 729 633 700M512 710V755','none',6)
    +(pockets?mirror(path('M393 723Q428 738 438 720','none',5,thread)):'');
}
add('pantalon','cargo','Pantalón cargo verde',trousers('#425b4a','#2c443c','#a0a777')+mirror(rect(388,772,53,46,9,'#536e54',ink,6)+path('M392 783H436','none',5,'#a0a777')));
add('pantalon','mezclilla','Jeans índigo',trousers('#4b6791','#324862','#ddb482'));
add('pantalon','lona','Pantalón de lona',trousers('#bd956c','#946b4d','#f2d79e'));
add('pantalon','jogger','Joggers grafito',trousers('#4d5166','#34384d','#939bae')+mirror(path('M397 748L402 866','none',9,'#939bae')));
add('pantalon','bermudas','Bermudas de playa',trousers('#387c85','#245d64','#bad8be',804));
add('pantalon','taller','Pantalón de taller',trousers('#526080','#35455e','#e2a860')+mirror(rect(395,801,67,50,10,'#698099',ink,6)),'Raro');
add('pantalon','velocidad','Pantalón de pista',trousers('#194e8b','#153966','#61c5d8',883,false)+mirror(path('M394 735L400 861','none',13,'#69d1d1')),'Raro');
add('pantalon','termico','Pantalón térmico',trousers('#694b71','#483655','#ca95b5')+mirror(path('M400 785H446M399 808H445','none',7,'#ca95b5')),'Raro');
add('pantalon','orbital','Pantalón presurizado',trousers('#e4e5de','#abbcc7','#60788c',877)+mirror(rect(400,801,66,43,10,'#8da9b7',ink,6)),'Épico');
add('pantalon','pixel','Pantalón de cantera',trousers('#7d684c','#5d4a37','#c4a36d')+mirror(path('M397 763H422V785H445V807H417V786H397Z','#a69261',5)),'Raro');

function sneaker(color,shade,sole,accent) {
  return mirror(path('M388 874L433 890L470 874L482 928Q489 951 463 958H375Q347 957 348 935Q348 910 379 901Z',color,11)
    +fillPath('M470 881L477 930L456 942L428 937L437 913L431 897Z',shade)
    +path('M349 933Q391 945 481 932L479 949L461 958H376Q355 958 350 946Z',sole,8)
    +path('M389 914L431 923M395 899L436 910','none',7,accent));
}
add('pies','sprint','Tenis de sprint terracota',sneaker('#c95241','#933638','#f4deaa','#ffcd66'),'Raro');
add('pies','lona','Tenis de lona',sneaker('#4b4161','#342e48','#f4e6d7',white));
add('pies','orbital','Botas orbitales',boot('#eee7dd','#9bb2b8')+mirror(rect(392,838,59,19,5,'#448988',ink,5)),'Épico');
add('pies','nieve','Botas de nieve',boot('#70577e','#4a3959')+mirror(path('M386 803H474L476 824H383Z','#e8d8c7',7)),'Raro');
add('pies','cobre','Botas con puntera de cobre',boot('#59443e','#3e3433')+mirror(path('M354 927Q372 901 403 901Q417 914 420 940L355 941Z','#bc7953',7)));
add('pies','pixel','Botas de cantera',mirror(path('M382 809H478V899H490V948H472V958H352V940H343V918H362V896H382Z','#7e6352',10)+path('M352 934H487M382 835H477','none',9,'#d3b591')),'Raro');

const hatBand = (base, brim, seam) => path('M340 219Q354 163 402 120Q433 98 449 123Q473 151 515 149Q552 146 574 118Q602 87 630 124Q666 164 685 218Z',base,12)
  +path('M341 212Q503 180 685 211L702 240Q519 214 323 243Z',seam,8)+path(capBrim,brim,12);
add('cabeza','pescador','Sombrero de pescador',path('M387 207L409 124Q509 83 616 124L640 209Z','#9fa073',11)
  +path('M401 158Q512 132 624 158','none',12,'#627c61')+path('M384 195Q518 169 642 195L710 263Q504 241 314 266Z','#b4b783',11)
  +path('M343 248Q510 221 680 245','none',6,'#697e62'));
add('cabeza','boina','Boina de artista',path('M353 228Q329 210 351 177Q380 125 489 107Q599 91 669 137Q708 163 685 201Q664 235 617 237Q510 217 353 248Z','#79638d',12)
  +path('M483 109L476 86Q481 72 494 80L510 107M364 230Q492 199 649 217','none',10)
  +path('M381 194Q422 151 504 139','none',8,'#b69bbd'));
add('cabeza','gorrito-punto','Gorrito de punto',path('M365 218Q362 119 437 87Q507 52 576 88Q659 116 660 219Z','#cc785e',12)
  +path('M422 217Q412 147 459 101M493 215Q482 152 507 88M572 215Q578 158 553 103M622 213Q620 168 592 135','none',8,'#f5aa83')
  +path('M360 210Q513 186 666 210L670 251Q515 224 354 252Z','#e39676',11));
add('cabeza','panama','Sombrero Panamá',hatBand('#efe0b4','#f4e7bf','#625142')+path('M357 249Q510 216 659 237','none',7,'#c6a877'));
add('cabeza','boina-taller','Gorra roja de taller',path('M343 220Q331 173 373 131Q420 84 511 81Q607 83 652 128Q690 160 681 214L656 239Q507 211 362 245Z','#db494c',13)
  +fillPath('M566 97Q645 104 675 162Q688 181 674 214L624 221Q629 156 566 97Z','#a93443')
  +path('M383 158Q422 118 482 116','none',10,'#fa8f75')+path(capBrim,'#c53646',12)
  +path('M344 243Q506 208 654 227','none',7,'#f27968'),'Raro');
add('cabeza','pua-azul','Capucha de púas azules',path('M349 274Q318 239 351 187L336 124L408 154Q432 116 397 78Q498 72 569 110Q608 116 706 82Q689 132 657 169L727 153Q713 200 669 227L697 232Q674 264 651 280L621 240Q514 205 399 245Z','#256dc0',12)
  +fillPath('M578 115Q632 107 691 94Q673 142 634 176L703 166Q681 204 641 226L677 235L650 270L627 234L577 223Q610 178 578 115Z','#234f96')
  +path('M357 143L387 174L358 181Z','#b7dce8',7)+path('M425 111Q479 111 524 136M371 216Q403 185 457 171','none',9,'#7bbdee'),'Épico');
add('cabeza','gorro-claraboya','Gorro Claraboya',path('M369 221Q373 172 385 150L392 61Q435 71 468 132Q512 104 557 134Q589 69 634 64L637 148Q652 177 655 221Z','#f4cf54',12)
  +mirror(path('M391 69Q423 79 443 105L386 122Z','#454054',8))
  +fillPath('M624 124Q647 164 649 220L607 215Q611 159 580 131Z','#d9963e')
  +path('M363 217Q514 196 663 219L660 252Q515 231 364 253Z','#f7d977',11),'Raro');
add('cabeza','exploracion','Gorro de vigía',path('M355 225Q399 160 436 117Q490 46 638 82L578 114Q608 153 673 225Z','#608754',12)
  +path('M365 205Q515 178 658 207L673 229Q515 203 355 232Z','#b89355',8)
  +path('M517 142Q541 101 580 101','none',8,'#a9bd6f')+path('M386 226Q519 197 650 226','none',8),'Raro');
add('cabeza','piloto','Gorro de aviador',path('M361 217Q363 112 512 103Q661 112 663 217L663 290L620 310L598 271L591 222Q510 202 432 222L426 271L404 310L361 290Z','#ab6d4d',12)
  +mirror(rect(378,181,110,44,15,'#a5cfcc',ink,10)+path('M394 204L418 193','none',6,'#edfff3'))+path('M488 201H536','none',11),'Raro');
add('cabeza','visor-nave','Casco de navegación',path('M359 260Q320 208 360 148Q409 81 512 80Q617 83 664 150Q706 201 665 260L620 236Q631 136 512 129Q394 136 404 236Z','#df755e',12)
  +path('M370 225Q513 192 655 225L640 264Q514 237 383 265Z','#7cd5cf',10)
  +path('M434 233L465 226','none',7,'#d8fff5'),'Épico');
add('cabeza','cantera','Capacete de cantera',path('M345 240V162H381V130H432V98H592V130H643V162H679V239H641V258H384V240Z','#b89c63',12)
  +fillPath('M593 136H637V167H671V232H634V247H573V201H593Z','#8e7349')
  +rect(484,162,56,48,4,'#d9d4a0',ink,7)+rect(500,176,24,20,2,'#eff9c3'),'Raro');
add('cabeza','lunar','Casco burbuja lunar',path('M367 389Q293 312 325 210Q357 78 512 80Q667 78 699 210Q731 312 657 389L624 395Q698 315 670 223Q641 111 512 112Q383 111 354 223Q326 315 400 395Z','#dfa2c2',12)
  +path('M374 394Q512 430 650 394L644 427Q512 464 380 427Z','#925c97',10)
  +mirror(path('M353 203Q383 139 431 125','none',10,'#fff4fc'))+star(641,155,1.65,'#fff0b4'),'Épico');

add('cara','ciclista','Visor de ciclismo',path('M369 288Q503 270 654 288L633 331Q596 359 554 340L514 318L470 341Q423 364 392 332Z','#8cd2d1',10)
  +path('M411 312L464 298M556 313L591 300','none',9,'#e9faf0'),'Raro');
add('cara','montura','Lentes de montura ámbar',glasses('none','#965837'));

add('torso','sprint','Chamarra de sprint azul',shirt('#276dcc','#22539a')
  +oval(512,598,87,104,'#f4d6a1',ink,8)
  +fillPath('M545 514Q598 544 592 610Q587 685 530 692Q572 650 565 602Q562 554 545 514Z','#d8ac80')
  +mirror(path('M352 501L390 519L417 498','none',11,'#87bce5')),'Épico');
add('torso','taller','Peto de taller',shirt('#db4a48','#a73742')
  +path('M405 465L449 451L476 530H548L575 451L619 465L593 552L624 707Q512 755 400 707L431 552Z','#3b65b8',11)
  +path('M478 565H547V619Q510 641 478 619Z','#5484cb',7)+mirror(oval(458,542,13,13,'#f7c658',ink,5))
  +path('M398 696Q511 724 627 696','none',6,'#789bc9'),'Raro');
add('torso','guardabosques','Camisa de guardabosques',shirt('#598454','#406748')
  +path('M513 484V731M421 528H472V578H421ZM557 528H608V578H557Z','none',8)
  +path('M397 648Q512 673 628 648','none',22,'#a28156')+rect(487,638,52,33,5,'#e0bd77',ink,6));
add('torso','claraboya','Sudadera Claraboya',shirt('#e4bc54','#c99041')
  +path('M455 470L449 535M569 470L575 535M452 653Q510 666 571 653L594 685Q513 702 430 685Z','none',8)
  +path('M502 541L483 573H512L498 609L546 563H521L535 541Z','#4c8f83',5),'Raro');
add('torso','aviacion','Chamarra de aviador',shirt('#98674f','#744b3c')
  +path('M430 467L468 524L512 493L555 524L594 466','none',25,'#f0d7af')+path('M512 522V732M409 626L467 604M557 604L615 626','none',9)
  +star(579,557,1.2,'#e9ad51'),'Raro');
add('torso','navegante','Traje de navegación',shirt('#e5c2a2','#b59080')
  +path('M404 550Q513 573 620 550L633 604Q514 618 391 604Z','#c17361',8)
  +rect(472,547,80,64,11,'#5d8888',ink,7)+path('M484 571H540M489 589H503','none',7,'#abded0'),'Épico');
add('torso','cantera','Chaqueta de cantera',shirt('#7d8963','#626c4c')
  +path('M398 535H472V555H504V582H470V598H423V575H398Z','#afaf77',7)
  +path('M560 569H615V624H560Z','#688177',7)+path('M510 484V732','none',8),'Raro');
add('torso','lunar','Traje de saltos lunares',shirt('#c989b4','#9d6496')
  +path('M407 495Q509 558 614 495','none',24,'#e9c4d5')
  +move(513,582,oval(0,0,41,27,'#b572ae',ink,7)+oval(-7,-5,20,20,'#f6d981',ink,5)+star(27,-8,.46,white)),'Épico');
add('torso','sudadera-avena','Sudadera avena',shirt('#e4ccb0','#bfa78f')+path('M444 487L453 543M579 487L572 543M467 632H559L576 676H448Z','none',8,'#9e745c'));
add('torso','tejido','Suéter tejido',shirt('#875b73','#6b4357')+path('M400 541Q510 570 624 541M393 651Q509 681 631 651','none',11,'#ddb2a5')
  +[439,511,583].map(x=>star(x,604,1.35,'#f0c898')).join(''));

add('espalda','vector','Mochila aerodinámica',mirror(path('M394 490Q303 470 291 574L293 701Q310 746 378 737L445 690Z','#4774a9',11)
  +path('M315 585L348 536L343 578H369L317 639L332 585Z','#87cccd',7)),'Épico');
add('espalda','rollo','Mochila con manta',pack+rect(300,450,424,75,30,'#d7ab71',ink,10)+mirror(path('M355 455V518','none',12,'#815d48')));
add('mano','llave','Llave ajustable de taller',path('M207 554Q182 583 199 616Q212 635 247 634L285 732Q301 750 322 736Q334 725 323 706L278 619Q305 590 283 561L262 601L233 594L229 556Z','#8a9da5',10)
  +path('M281 670L302 711','none',8,'#d2e1db'));
add('mano','cartografia','Mapa plegado',path('M173 618L228 599L272 619L324 602L327 704L278 725L233 706L183 723Z','#f3de9c',9)
  +path('M228 602L233 705M272 620L278 723','none',6,'#aa8b5f')+path('M194 673Q223 641 251 663Q281 686 312 635','none',8,'#668c60')
  +star(291,646,.7,'#b76146'));
add('mano','gemacubica','Mineral cúbico',path('M272 613L327 650V707L275 742L217 707V650Z','#72b3ae',10)
  +path('M217 650L274 683L327 650M274 683V742','none',7)
  +fillPath('M259 634L282 630L306 648L284 661Z','#afe3cd'),'Raro');
add('mano','brujula','Brújula de viaje',move(270,698,oval(0,0,46,46,'#e0af67',ink,10)+oval(0,0,34,34,'#f5e3ba',ink,5)
  +path('M-14 16L-7 -8L16 -21L7 8Z','#4d8c78',5)),'Raro');
add('mano','termo','Termo',move(267,693,`<g transform="rotate(-20)">${rect(-29,-53,58,117,16,'#77a399',ink,9)+rect(-31,-62,62,25,8,'#486d69',ink,7)+rect(-21,-14,42,25,5,'#e4d0a6')}</g>`));
add('mano','sonda','Módulo de señal',move(271,687,rect(-52,-38,104,76,18,'#c98373',ink,8)+rect(-39,-26,65,39,7,'#bce0cc',ink,6)
  +path('M15 -39L25 -71','none',8)+oval(34,18,5,5,'#f3e1a2')),'Épico');
add('mano','cometa','Cometa de papel',path('M285 715Q323 651 251 587','none',8)
  +path('M252 451L317 526L251 592L186 525Z','#ce777e',10)+path('M252 451V591M187 524H315','none',6)
  +fillPath('M254 463L305 521H254Z','#e7ae67'),'Raro');
add('cuello','bandana-pista','Bandana de pista',path('M400 453Q511 487 625 453L632 496Q541 523 502 554L466 526Q436 528 393 491Z','#91d9d3',10)
  +path('M423 477Q509 505 601 477','none',8,'#f1f5d8'),'Raro');
add('cuello','bufanda-ocre','Bufanda ocre',path('M405 455Q505 480 612 452L637 497Q577 525 543 519L563 605L515 615L489 526Q447 524 389 493Z','#d4a457',10)
  +path('M427 471L418 504M469 481L463 516M517 562L551 551M526 585L554 575','none',8,'#efd496'));

const horizon = (sky,hill,ground,far) => rect(0,0,1024,1024,0,sky)
  +fillPath('M0 672Q143 432 313 516Q434 587 538 554Q827 374 1024 634V1024H0Z',far)
  +fillPath('M0 789Q232 639 468 745Q759 655 1024 747V1024H0Z',hill)
  +fillPath('M0 888Q265 811 522 868Q801 821 1024 903V1024H0Z',ground);
add('fondo','costa-turbo','Circuito costero',horizon('#c5e8ec','#79b2a8','#d3c098','#8ec1ba')
  +oval(842,196,83,83,'#ffe39a')+path('M0 913Q264 833 522 904Q799 848 1024 926','none',100,'#627b83')
  +path('M0 914Q264 834 522 905Q799 849 1024 927','none',10,'#e1d89c')+cloud(171,237,1.4,'#f4f6da'),'Raro');
add('fondo','taller','Azoteas de ladrillo',horizon('#efdcc2','#b19c86','#c69270','#c2a798')+skyline(['#bd8066','#dba279','#c68f74'])
  +[692,753,810].map((y,i)=>path(`M${720+i*55} ${y}h100`,'none',11,'#705d64')).join(''),'Raro');
add('fondo','bosque','Bosque de miradores',horizon('#e2e9c9','#83a17a','#a1b085','#a3ba88')
  +[82,164,872,965].map((x,i)=>move(x,620+i*17,fillPath('M0-209L-67-100H-40L-94-11H-15V63H15V-11H94L40-100H67Z',i%2?'#68896e':'#4d7463'),.9)).join(''));
add('fondo','luna','Horizonte lunar',horizon('#524b81','#8581a5','#a69db4','#736a9d')+oval(816,233,107,107,'#f4d899')
  +[[108,175],[834,83],[937,379],[202,396],[74,478],[742,313]].map(([x,y],i)=>star(x,y,i%2?.72:1.14,'#f9e3b0')).join('')
  +oval(126,932,92,23,'#8d82a1')+oval(909,874,70,18,'#8d82a1'),'Épico');
add('fondo','cantera','Mundo de bloques',rect(0,0,1024,1024,0,'#cbe1ce')
  +fillPath('M0 580H120V473H260V571H348V672H756V552H865V447H1024V1024H0Z','#8cac79')
  +fillPath('M0 720H182V650H309V756H747V674H891V746H1024V1024H0Z','#718f70')
  +fillPath('M0 895H143V856H351V900H653V867H851V899H1024V1024H0Z','#b8a57c')
  +[93,892].map((x,i)=>rect(x,177+i*57,144,55,0,'#edf1d7')).join(''),'Raro');
add('fondo','nublado','Mirador de invierno',horizon('#d8e5ec','#aebfce','#e8e7e3','#b9cdd5')
  +cloud(156,257,1.2,'#f4f4ed')+cloud(865,319,1.2,'#f4f4ed')+oval(804,209,78,78,'#eee0bd'));

add('efecto','velocidad','Estelas de velocidad',[[137,384],[820,456],[143,767],[851,803],[95,604],[809,620]].map(([x,y],i)=>
  path(`M${x} ${y}l${i%2?108:72} -16`,'none',i%2?13:8,i%2?'#f3d887':'#f4fff2')).join(''),'Épico');
add('efecto','cuadritos','Fragmentos pixel',[[128,395],[855,335],[192,478],[850,700],[922,579],[134,790]].map(([x,y],i)=>
  rect(x,y,14+i%3*11,14+i%3*11,0,['#f5de8f','#d5d69e','#a5dfcf'][i%3])).join(''),'Raro');
add('efecto','electricidad','Chispas eléctricas',[[170,330],[842,359],[132,651],[881,668]].map(([x,y])=>
  move(x,y,path('M4-29L-17 3H4L-6 27L22-9H7L17-29Z','#f5cf56',5),.9)).join(''),'Épico');

group('peinado','Peinados','hair','292 58 440 409','Sin peinado');
add('peinado','fleco','Fleco de lado',path('M357 240Q360 163 419 133Q474 92 548 117Q628 114 660 181Q678 214 651 267L610 243L604 206Q564 251 477 253L496 219Q430 262 357 240Z','#744735',11)
  +path('M388 211Q434 145 508 148M489 197Q549 178 575 150','none',9,'#b57752'));
add('peinado','rizos','Rizos chocolate',path('M370 230Q340 218 351 189Q354 163 385 163Q377 126 414 112Q448 92 467 116Q489 77 527 99Q554 105 557 126Q588 102 616 124Q640 141 630 165Q672 161 679 192Q687 225 650 237Q608 249 578 225Q553 246 519 227Q496 248 461 225Q434 247 403 227Q384 241 370 230Z','#574038',11)
  +path('M399 167Q413 148 432 163M466 165Q485 131 507 151M552 171Q570 148 597 165M629 187Q645 183 650 200','none',8,'#95654f'));
add('peinado','ondas','Ondas cobrizas',path('M354 253Q328 216 351 175Q386 116 454 110Q502 90 542 118Q610 101 651 146Q685 179 666 228L647 263Q629 239 628 198Q601 209 567 193Q520 235 477 203Q427 241 393 202Q382 223 384 251Z','#ae653f',11)
  +path('M383 178Q430 145 484 153M483 166Q527 139 565 151M567 175Q611 152 636 181','none',8,'#ecad70'));
add('peinado','trenzas','Trenzas con cuentas',path('M363 232Q354 172 401 130Q457 94 514 129Q576 92 622 131Q669 168 665 233L629 257Q602 193 512 167Q424 188 396 256Z','#593c43',11)
  +mirror(path('M373 229Q336 245 344 292Q316 314 332 349Q309 378 328 414Q331 446 357 446Q381 423 371 399Q389 371 365 348Q385 318 366 297Q397 267 391 235Z','#82505d',9)
  +path('M347 289L371 303M333 348L362 361M329 402L367 414','none',8,'#ba7c7c')
  +rect(327,407,48,15,6,'#6fb1a2',ink,5)));
add('peinado','llama-astral','Puntas de llama astral',path('M365 236Q343 223 347 197L307 152Q355 154 389 174L370 95Q422 120 441 153Q443 99 451 48Q493 76 515 133Q527 79 576 40Q572 96 559 140Q599 100 649 97L612 163L678 146Q654 191 638 209L648 246L602 232L574 254L539 214L505 257L465 222L422 246L411 220Z','#ffd34c',12)
  +fillPath('M458 66Q478 118 476 178L513 142L507 194L568 61L554 158L616 122L584 184L650 165L605 218L575 240L541 205L505 245L466 211L425 235L430 196L408 168L401 122L436 164L452 180Z','#eca438')
  +path('M429 181L405 143M482 153L463 93M546 157L560 112M579 189L611 152','none',8,'#ffefab'),'Épico');
add('peinado','rubio','Mechones rubios',path('M350 230L339 175L379 185L355 128L416 151L424 83L472 132L506 68L523 126L568 91L562 144L617 111L605 156L657 140L633 184L685 181L653 227L601 246L564 214L521 236L504 209L462 238L433 218L394 247Z','#fadc58',11)
  +fillPath('M510 86L522 137L554 113L550 154L598 135L586 167L636 158L612 195L661 192L640 219L603 233L565 202L522 224L504 194L478 215L488 162Z','#d39b36')
  +path('M379 152L412 173M436 115L456 146M506 110L496 140','none',7,'#fff4af'),'Raro');
add('peinado','fleco-marino','Fleco negro de manga',path('M359 243Q363 184 425 162Q512 129 600 169Q652 191 662 242L633 287L604 251L592 229L560 259L530 229L499 255L475 224L435 253L413 234L385 279Z','#342e36',11)
  +path('M409 213Q425 185 464 180M549 176Q591 181 612 206','none',8,'#74606a'));
add('ojos','almendrados','Almendrados',brows()+mirror(path('M421 321Q451 286 481 321Q450 357 421 321Z',white,7)
  +oval(453,322,13,17,ink)+oval(449,316,5,6,'#fff')));
add('ojos','guiño','Guiño',brows()+oval(452,321,27,34,white,ink,8)+oval(459,322,13,20,ink)+oval(455,315,5,7,'#fff')
  +path('M545 328Q572 300 598 328M589 319L598 311','none',9));
add('marcas','vetas','Vetas de madera',mirror(path('M376 302Q360 331 383 351Q398 365 382 387M402 338Q391 352 407 366','none',7,'#895335'))
  +path('M483 273Q514 257 548 273M591 281Q618 290 626 312','none',6,'#895335'));
add('marcas','mejilla-marina','Marquita de travesía',path('M431 356L455 350M436 348L439 361M447 346L450 357','none',5,'#8a4b38'));
add('marcas','rayas-viento','Rayas de viento',mirror(path('M379 345L417 354M380 361L413 370','none',7,'#9f5c4b')));
add('marcas','circo','Rubor bicolor',oval(394,356,24,11,'#ec747e')+oval(629,356,24,11,'#8380d9')
  +star(397,341,.47,'#ffe68b')+star(626,341,.47,'#ffe68b'));

group('cintura','Cintura','waist','324 627 376 207','Sin accesorio');
add('cintura','faja-oceano','Faja de marea',path('M385 648Q510 685 640 647L638 698Q610 711 583 709L601 775L571 763L551 788L533 728Q447 723 383 694Z','#e6ad42',9)
  +path('M403 668Q509 702 616 672M566 717L580 750','none',7,'#ffe28d'));
add('cintura','tutu','Tutú de gala',path('M386 631Q510 663 638 631L713 733Q687 770 644 757Q609 788 563 772Q510 796 462 773Q414 790 381 757Q333 770 311 733Z','#efb5ce',11)
  +fillPath('M323 731Q509 751 698 730L706 737Q680 765 644 749Q607 779 562 766Q511 788 463 765Q414 782 382 749Q348 763 323 738Z','#cd7fac')
  +path('M411 669L353 742M457 678L426 759M509 684V773M559 679L594 756M610 669L668 741','none',7,'#fff1e8')
  +path('M386 631Q512 657 638 631L651 663Q514 696 373 663Z','#b65b8c',9)
  +star(513,660,.75,'#ffe58e'),'Raro');
add('cintura','riñonera','Riñonera',path('M384 655Q516 675 640 649L642 681Q512 711 382 687Z','#505c68',8)
  +path('M469 654Q520 645 577 654L584 705Q522 720 463 702Z','#d69969',9)
  +path('M485 668Q525 662 565 667L565 683','none',6,'#f7dbab'));

add('cabeza','madera-resonante','Tocado de madera resonante',path('M357 274Q342 261 350 214L357 108Q357 48 495 44Q635 39 655 102L667 232Q666 272 648 280L615 258Q508 219 396 264Z','#bd8353',12)
  +fillPath('M606 107L648 97L659 230Q661 256 650 271L613 252Q623 198 606 107Z','#a36843')
  +oval(506,93,149,50,'#e4b17d',ink,10)
  +oval(509,93,116,32,'none','#a46c47',7)+path('M450 95Q481 69 538 85Q563 98 532 103Q511 107 489 100','none',7,'#9a623d')
  +path('M383 141Q371 193 387 234M419 150Q399 190 421 225M451 152Q449 181 465 199M560 153Q580 190 567 217M599 147Q620 184 607 229M504 174Q489 196 507 218Q525 195 504 174Z','none',9,'#875135'),'Raro');
add('cabeza','taza-expresso','Tocado de taza',path('M649 196Q701 175 730 202Q766 239 741 289Q721 327 665 323L667 292Q704 289 715 266Q729 219 680 233Z','#fff0de',11)
  +'<path d="M330 172Q511 209 694 172L684 318Q668 444 605 476Q566 494 512 494Q461 494 418 475Q354 441 340 317Z M386 271Q416 231 512 232Q611 231 639 271Q664 307 647 365Q637 393 616 408Q603 458 512 464Q421 458 408 408Q387 393 377 365Q360 307 386 271Z" fill="#fff1e4" fill-rule="evenodd" stroke="#3b2314" stroke-width="10" stroke-linejoin="round"/>'
  +fillPath('M653 202L685 190L677 319Q659 443 601 469Q554 487 484 485Q625 460 642 349Z','#e4c2bb')
  +oval(512,169,184,56,'#fff7eb',ink,11)+oval(512,171,151,36,'#9d6348')
  +path('M448 177Q474 145 512 171Q545 145 578 175Q550 197 513 198Q477 196 448 177Z','#f3d2ab',4,'#f3d2ab')
  +path('M512 194Q518 207 532 210','none',5,'#f3d2ab'),'Raro',{view:'257 99 512 426'});
add('cabeza','sombrero-marea','Sombrero de paja de marea',path('M373 211L401 124Q432 96 491 103L571 96Q600 97 622 117L652 208Z','#e9bd6e',11)
  +path('M382 182Q519 148 643 176L653 211H372Z','#c74746',9)
  +path('M275 226Q428 178 679 200Q741 208 752 231Q760 255 689 268Q481 247 323 276Q282 280 270 257Q261 242 275 226Z','#f1cb81',12)
  +path('M301 245Q488 215 717 239','none',6,'#b68649')
  +path('M574 174L596 168L604 190L583 197Z','#e7a65a',5),'Raro');
add('cabeza','banda-amanecer','Banda del amanecer',path('M351 232Q513 191 663 227L673 273Q516 230 351 275Z','#374766',10)
  +path('M446 217Q511 207 578 215L582 258Q513 246 442 263Z','#c9d9d6',8)
  +path('M481 236Q505 221 527 227L546 236M489 242Q510 230 528 237L537 242M501 248Q514 241 526 246','none',4,'#52677b')
  +mirror(oval(458,239,5,5,'#809998'))+path('M655 257Q689 250 720 274L689 282L712 309Q679 304 651 280Z','#374766',8),'Raro');
add('cabeza','casco-espacial','Casco Centinela',path('M346 310L316 257L337 165L403 107L459 80H565L621 107L687 165L708 257L678 310L662 390L611 424L587 385L612 338L607 273Q513 239 417 273L412 338L437 385L413 424L362 390Z','#697a48',13)
  +fillPath('M566 88L616 114L678 171L701 253L673 306L654 381L613 409L598 385L625 342L619 261L595 198Z','#3d553d')
  +path('M357 185L396 174L429 139H595L628 174L669 185M359 366L391 372M665 366L633 372','none',10,'#aab278')
  +path('M369 269L398 232L454 224L471 237H553L570 224L626 232L655 269L625 331L567 350L553 341H471L457 350L399 331Z','#6a5032',10)
  +path('M383 274L406 242L457 237L475 247H549L566 237L618 242L641 274L615 321L568 338L551 328H473L456 338L409 321Z','#e2a13d',7)
  +fillPath('M403 280L424 252L471 252L485 259H577L564 273L469 285L449 280Z','#ffe49b')
  +path('M582 310L613 293','none',9,'#fbc660')
  +path('M381 345L399 345M643 345L625 345','none',7,'#c2d5ab'),'Épico');
add('cabeza','gorro-circo','Gorro de carpa pixel',path('M357 243Q310 199 317 144Q323 69 396 61Q450 58 511 141Q573 62 629 69Q702 77 706 152Q708 208 667 242L626 238Q648 185 615 150L572 187Q553 210 550 232Z','#db5055',12)
  +path('M511 141Q573 62 629 69Q702 77 706 152Q708 208 667 242L626 238Q648 185 615 150L572 187Q553 210 550 232L506 231Q484 186 511 141Z','#4657a9',10)
  +path('M348 126Q365 92 397 94M628 101Q668 107 678 144','none',9,'#ffbe8c')
  +path('M355 221Q513 190 673 222L667 255Q514 226 362 255Z','#f0bc54',10)
  +oval(324,159,22,24,'#ffda79',ink,8)+oval(702,164,22,24,'#ffda79',ink,8)
  +rect(499,175,26,26,3,'#f5d38c',ink,6),'Épico');

add('torso','madera-resonante','Chaleco de percusión',path('M413 458Q512 479 611 458Q628 510 625 557L639 680Q620 727 512 735Q403 727 385 680L399 557Q396 510 413 458Z','#bc8154',12)
  +fillPath('M578 474L608 465Q625 524 620 567L633 677Q618 714 530 726Q586 697 573 665Z','#a26945')
  +path('M419 493Q440 540 420 583Q410 611 425 657M467 495Q449 537 471 568Q488 599 464 641Q454 662 463 690M568 497Q592 539 571 580Q554 614 579 654M604 575Q594 608 609 647','none',8,'#895336')
  +path('M506 521Q518 521 518 533V664Q512 681 501 665V533Z','#593726',7),'Raro');
add('torso','expresso','Corpiño de escenario',path('M417 459L452 454L470 507Q511 526 554 506L572 454L606 460L597 520Q578 563 615 635L629 690Q514 732 395 690L409 635Q445 563 427 520Z','#dc8ab0',11)
  +path('M431 524Q470 536 512 563Q555 536 593 524L584 576Q512 617 440 576Z','#ffe1e8',9)
  +path('M456 592Q468 614 465 644M568 592Q556 614 559 644','none',8,'#ae6294')
  +star(511,559,1.25,'#f8c974'),'Raro');
add('torso','marea','Chaqueta de capitán de marea',mirror(path('M423 461L463 453L471 511L487 703Q437 716 390 694L399 540Q367 533 382 491Z','#d04d48',11)
  +fillPath('M433 469L458 459L471 529L481 700L453 700L442 589Z','#a33542')
  +path('M411 486Q399 506 410 522','none',8,'#f18d63')
  +[543,580,617].map(y=>oval(458,y,7.5,7.5,'#f8cb70',ink,4)).join('')));
add('torso','alien-astral','Uniforme astral',shirt('#ec7836','#c65137')
  +path('M408 471L512 556L617 471L634 499L513 600L390 499Z','#3f508c',9)
  +path('M422 499L512 572L601 498','none',7,'#6c87bb')
  +path('M390 657Q510 681 634 657L635 700Q510 733 388 700Z','#354983',9)
  +mirror(path('M298 617L333 637L350 605L315 586Z','#3b4e8c',8))
  +oval(579,580,27,27,'#f9dab0',ink,6)+star(579,580,.9,'#b3523d'),'Épico');
add('torso','ninja-viento','Chaqueta de acecho',shirt('#eb793b','#bf522e')
  +path('M419 454L474 482H550L605 454L661 478L696 535L653 561L631 540L619 567L551 555H473L405 567L393 540L371 561L328 535L363 478Z','#343951',8)
  +path('M452 469L485 499H539L572 469','none',12,'#eec18b')
  +path('M512 501V729M408 647L462 630M616 647L563 630','none',8)
  +path('M462 590L504 589M519 589L561 590','none',6,'#f8b76d'),'Raro');
add('torso','espacial-centinela','Armadura Centinela',shirt('#3c4849','#293437')
  +mirror(path('M317 533L341 489L372 467L425 467L448 508L423 544L375 566Z','#7b8c51',10)
  +path('M339 524L382 490H420','none',8,'#a5b068')
  +path('M309 566L351 584L365 610L338 657L299 644L288 618Z','#64764c',9))
  +path('M404 533L451 503L512 522L573 503L620 533L610 632L579 665H445L414 632Z','#778650',11)
  +path('M426 547L479 533L512 542L545 533L598 547L595 584L548 611H477L429 584Z','#465740',8)
  +path('M433 633Q512 647 590 633L577 674H447Z','#9ba162',8)+path('M479 571H545','none',8,'#e2b749'),'Épico');
add('torso','futbol-costa','Camiseta Costa FC',shirt('#f5ead2','#d6cdb5')
  +path('M402 476L437 466L444 719L411 706Z','#297c81',6,'#297c81')
  +path('M494 480Q513 492 531 480L537 730H487Z','#297c81',5,'#297c81')
  +path('M588 467L622 479L613 705L580 718Z','#297c81',6,'#297c81')
  +path('M447 466Q511 499 576 466M337 529L375 552M687 529L649 552','none',11,'#235757')
  +rect(462,552,100,84,11,'#f7eed7','#235757',6)
  +path('M479 579L491 568H500V617M522 575Q539 563 546 578V607Q544 622 529 617Q521 616 521 603Z','none',8,'#244752')
  +move(580,529,fillPath('M-15-16H15V0Q15 11 0 17Q-15 11-15 0Z','#e9bd64')+fillPath('M-8 4L7 -9L11 -3L-4 11Z','#387f7e')));
add('torso','circo-pixel','Traje de función pixel',shirt('#db5157','#9c445d')
  +path('M512 472Q563 473 605 449L659 475L704 537L651 569L633 548L641 692Q578 743 512 735Z','#4959ab',10)
  +path('M406 470L449 455L512 477L575 455L618 470L625 515L582 531L551 514L512 544L473 514L442 531L399 515Z','#f3c864',9)
  +oval(512,567,13,13,'#ffe18b',ink,6)+oval(512,613,13,13,'#ffe18b',ink,6)
  +path('M446 600L466 622L446 645L425 622Z','#fff0a5',5)+path('M578 600L599 622L578 645L558 622Z','#ec7274',5),'Épico');

add('pantalon','leggings','Mallas de baile',trousers('#efc5d0','#cb94ae','#fff0e9',886,false)+mirror(path('M399 838L463 857M398 861L459 875','none',6,'#fae2df')));
add('pantalon','marea','Pantalón de travesía',trousers('#4b6a85','#3a4f66','#c3b599',837)+mirror(path('M386 817Q428 824 481 817L476 840Q437 847 389 840Z','#b6bfa8',7)));
add('pantalon','rastro','Pantalón de ruta',trousers('#e7803b','#bc512e','#ffc278')+mirror(path('M391 775L448 783M391 797L444 805','none',9,'#e8cba9')));
add('pantalon','astral','Pantalón de combate astral',trousers('#ed8139','#be5830','#ffc66f',891,false)
  +mirror(path('M397 763Q420 777 408 812M445 783Q429 820 441 853','none',7,'#ac5130')),'Raro');
add('pantalon','duelas','Pantalón de duelas',trousers('#b77b52','#935c40','#e0ad7b')
  +mirror(path('M408 765Q396 803 418 833Q432 851 419 880M442 767Q457 797 442 816','none',6,'#855035')));
add('pantalon','centinela','Pantalón de exploración blindado',trousers('#565e46','#3a4637','#a6ac70')
  +mirror(path('M392 767L454 777L467 813L444 855L398 843Z','#889358',8)+path('M404 790L448 795M407 811L447 816','none',7,'#bec48b')),'Épico');
add('pantalon','futbol','Short de fútbol',trousers('#284e61','#1c3444','#b1c4b8',817,false)+mirror(path('M395 739L401 797','none',9,'#f4d791')));
add('pantalon','circo','Pantalón de carpa',trousers('#d65362','#aa3a4d','#f9bc70')
  +path('M512 698Q592 710 630 674Q645 721 637 772L630 886Q586 896 551 886L536 785Q529 754 512 757Z','#4959a9',8)
  +mirror(path('M396 779L417 759L437 781L416 801Z','#f2bb61',6)));
add('pies','danza','Zapatillas de danza',mirror(path('M386 881Q428 893 470 880L477 938Q473 956 446 960H379Q353 960 354 940Q355 917 386 900Z','#dc8cb0',10)
  +path('M383 908Q414 896 438 916Q416 924 407 945H366Z','#f1b5cb',7)+path('M391 884L451 905M455 883L395 914','none',8,'#fff1e5')));
add('pies','medias-futbol','Tacos y medias de fútbol',boot('#f5dfad','#c9b783')
  +mirror(path('M386 837H467M383 855H467','none',10,'#3d8d87')
  +path('M384 893Q426 909 468 892L480 925V947L458 958H372Q350 953 351 934Q354 910 384 893Z','#52705e',8)
  +path('M379 950V960M408 952V961M445 950V960','none',8)));
add('pies','botas-astrales','Botas astrales',boot('#4f638b','#344869')+mirror(path('M387 825L437 861L473 825M382 847L426 880L458 856','none',8,'#efaa66')),'Raro');
add('pies','centinela','Botas Centinela',boot('#596c45','#354937')+mirror(path('M354 931L382 904L435 897L465 916L464 939H360Z','#879460',7)
  +path('M398 831L447 841L441 882L396 874Z','#738357',7)),'Épico');
add('pies','ninja','Sandalias de ruta',mirror(path('M386 866L474 866L470 906L477 940Q479 956 452 960H376Q351 958 353 941Q357 920 383 902Z','#3e4961',10)
  +path('M357 936Q381 912 418 920L436 940L419 953H369Q356 952 357 936Z','#f5c38f',7)
  +path('M382 919L385 950M396 918L401 950M387 880L469 891','none',5)));

add('mano','tambor','Tambor de ranura',path('M208 657Q211 623 277 616Q343 619 344 648L341 719Q337 753 277 756Q213 756 211 721Z','#c68658',10)
  +oval(277,647,64,27,'#e8ad73',ink,8)+path('M266 646Q279 636 293 645','none',9)
  +path('M227 673Q221 712 237 735M319 677Q331 709 318 735','none',7,'#8d573a'));
add('mano','baqueta','Baqueta de percusión',move(274,687,`<g transform="rotate(-27)">${path('M-13-73H13L10 52Q8 69 0 69Q-8 69-10 52Z','#c08b61',8)+oval(0,-80,23,32,'#9b6447',ink,8)+path('M-11-84Q-4-99 4-99','none',6,'#dfae77')+path('M-3-45V43','none',5,'#e2ad78')}</g>`));
add('mano','taza','Taza de espresso',path('M296 670Q326 656 338 675Q348 696 324 708L301 713L301 697Q323 698 323 687Q320 678 299 686Z','#eccec5',8)
  +path('M225 664H307L299 711Q274 736 235 715Z','#f3dfd1',8)
  +oval(267,666,41,12,'#a5765f',ink,6)+path('M257 646Q239 629 251 611M276 638Q286 621 278 605','none',7,'#f3e2cc'));
add('mano','catalejo','Catalejo de marea',move(266,683,`<g transform="rotate(-32)">${path('M-31-59H31L24-19H19V60H-19V-19H-24Z','#507c83',9)+rect(-34,-61,68,20,7,'#d9b779',ink,7)+rect(-22,46,44,17,5,'#d9b779',ink,6)+path('M-11 -28V26','none',6,'#b6d3bd')}</g>`));
add('mano','orbe-astral','Orbe astral',move(264,684,oval(0,0,66,66,'#64c4e8','#46588d',8)+oval(-5,-5,46,45,'#c0f2ed')
  +path('M-57-25L-82-47M53-33L76-52M61 20L84 30M-47 43L-72 62','none',8,'#a6edee')+star(-3,-5,2,'#fffbdf')),'Épico');
add('mano','pergamino','Rollo de ruta',move(270,689,`<g transform="rotate(28)">${rect(-49,-24,98,48,16,'#e8c79a',ink,8)+rect(-57,-28,26,56,12,'#c88974',ink,7)+rect(30,-28,27,56,12,'#c88974',ink,7)+path('M-4 -22V20M-11 -2L14 13','none',8,'#4b827b')}</g>`));
add('mano','balon','Balón de fútbol',move(248,689,oval(0,0,68,68,'#fff5de',ink,9)
  +path('M0-25L27-8L16 22H-16L-27-8Z','#293d45',5)
  +fillPath('M-21-60Q0-74 22-61L9-45H-8ZM-64-20L-47-22L-46-4L-63 11Q-71-4-64-20ZM64-20L47-22L46-4L63 11Q71-4 64-20ZM-40 52L-31 40L-10 50L-6 67Q-26 65-40 52ZM40 52L31 40L10 50L6 67Q26 65 40 52Z','#293d45')
  +path('M0-24V-51M26-7L51-15M16 22L29 42M-16 22L-30 44M-25-7L-53-14','none',6)));
add('mano','pelotas-circo','Pelotas de malabares',move(264,690,oval(-9,-42,22,22,'#dcaa65',ink,7)+oval(-34,-9,22,22,'#72b6a5',ink,7)+oval(24,-7,24,24,'#b083bc',ink,7)
  +star(26,-9,.72,'#f5dca7')));

add('fondo','tablado','Tablado ámbar',rect(0,0,1024,1024,0,'#91756d')
  +oval(512,465,363,470,'#cf9a7a')+fillPath('M0 0H211Q190 246 107 450Q188 715 92 829H0ZM1024 0H813Q834 246 917 450Q836 715 932 829H1024Z','#6c526e')
  +rect(0,805,1024,219,0,'#ba927b')+path('M0 906H1024M289 807L247 1024M736 807L787 1024','none',8,'#9c776e')+oval(512,917,324,71,'#cba587'));
add('fondo','escenario-lila','Escenario de danza',rect(0,0,1024,1024,0,'#a58cae')
  +oval(512,422,370,465,'#ddbdcd')+fillPath('M0 0H180Q188 305 79 622L110 795H0ZM1024 0H844Q836 305 945 622L914 795H1024Z','#78658e')
  +rect(0,785,1024,239,0,'#caa5bc')+oval(512,913,324,57,'#e5c3cb')
  +[[208,246],[820,236],[166,512],[887,464]].map(([x,y])=>star(x,y,1.28,'#f9deb5')).join(''));
add('fondo','marea','Puerto de marea',horizon('#f5dab4','#88b8ad','#8cabc1','#b1bdab')
  +oval(832,239,88,88,'#f5b47f')+path('M18 780Q190 754 305 781M692 814Q835 793 1000 811','none',12,'#d6e1cc')
  +fillPath('M239 892L363 767H670L791 892L938 1024H85Z','#c9a27c')+path('M206 918H819M128 980H899','none',9,'#967b6d'));
add('fondo','aurora','Aurora astral',rect(0,0,1024,1024,0,'#415980')+oval(511,455,331,331,'#7790a2')
  +path('M0 689Q189 591 329 627Q779 490 1024 296','none',70,'#8cb3ba')
  +path('M0 749Q225 606 387 659Q812 547 1024 365','none',24,'#bbcfbd')
  +fillPath('M0 899Q220 810 512 885Q820 820 1024 886V1024H0Z','#66858e')
  +[[172,318],[839,183],[236,571],[884,625]].map(([x,y])=>star(x,y,1.75,'#ffe7aa')).join(''),'Épico');
add('fondo','cielo-ninja','Sendero al amanecer',horizon('#f1cab3','#a88d8d','#c7a293','#c0a1a0')
  +oval(201,268,91,91,'#f5dbab')+cloud(817,287,1.25,'#f9e2c4')
  +fillPath('M0 691L247 567L340 711L304 749L0 820ZM1024 623L820 529L703 687L756 727L1024 807Z','#847d91')
  +[190,807,918].map((x,i)=>path(`M${x} ${764+i*15}l65 -19`,'none',8,'#eed4b7')).join(''));
add('fondo','hangar','Hangar Centinela',rect(0,0,1024,1024,0,'#497477')
  +rect(161,132,702,654,95,'#75a39e')+rect(211,178,602,615,68,'#90b8ab')
  +path('M115 124V758M908 124V758M263 230H762','none',18,'#a1c4af')
  +fillPath('M0 795H1024V1024H0Z','#547780')+path('M157 809L86 1024M868 809L936 1024','none',13,'#deb879'),'Raro');
add('fondo','cancha','Cancha al atardecer',rect(0,0,1024,1024,0,'#f3d6ab')
  +oval(787,219,82,82,'#fac27f')+fillPath('M0 548H1024V1024H0Z','#78957d')
  +path('M29 569H995M30 610H998','none',25,'#a0b093')
  +fillPath('M0 682H1024V1024H0Z','#6d9d77')
  +path('M0 733H1024M0 864H1024M512 733V1024','none',12,'#dbe9c5')+oval(512,883,198,85,'none','#dbe9c5',12)
  +path('M696 737V561H947V737','none',15,'#f4ecce')
  +path('M735 574V729M777 574V729M819 574V729M861 574V729M903 574V729M706 604H936M706 644H936M706 684H936','none',6,'#c0d2ae')
  +rect(107,373,19,210,4,'#6d8d88')+rect(65,342,105,54,6,'#617a7c')
  +[77,100,123,146].map(x=>rect(x,356,13,26,3,'#fff0ca')).join(''));
add('fondo','circo-pixel','Carpa de píxeles',rect(0,0,1024,1024,0,'#eacdb7')
  +fillPath('M0 0H170L319 571H0ZM1024 0H854L705 571H1024Z','#a873a3')
  +fillPath('M371 0H445L463 571H319ZM653 0H579L561 571H705Z','#de9d9f')
  +path('M143 738V634Q152 401 512 412Q872 401 881 634V738','none',55,'#745681')
  +path('M143 720V634Q152 401 512 412Q872 401 881 634V720','none',12,'#f4c272')
  +fillPath('M0 735H1024V1024H0Z','#8fa5bb')
  +Array.from({length:15},(_,i)=>rect((i%5)*205+(Math.floor(i/5)%2)*102,735+Math.floor(i/5)*96,102,96,0,'#ecdac2')).join('')
  +[[129,278],[899,245],[162,501],[836,589]].map(([x,y],i)=>rect(x,y,32,32,0,i%2?'#75b0b4':'#f2bb71')).join(''),'Épico');

add('efecto','ritmo','Pulso de percusión',[[161,315],[819,375],[143,655],[855,633]].map(([x,y])=>move(x,y,path('M-23 8Q0-18 23 8M-38-3Q0-42 38-3','none',8,'#f4c785'))).join(''),'Raro');
add('efecto','chispa-astral','Destellos astrales',[[120,236],[891,321],[157,596],[842,615],[209,792],[868,803]].map(([x,y],i)=>star(x,y,i%2?2:1.25,i%2?'#ffc279':'#e7f3d6')).join('')
  +path('M166 888L99 788L191 830L136 713M855 894L919 759L848 823L920 643M176 404L112 333L182 368','none',13,'#f8cc6a'),'Épico');
add('efecto','confeti','Confeti pixel',Array.from({length:14},(_,i)=>{const x=i%2?762+(i*31)%169:78+(i*41)%160;const y=145+(i*71)%670;return rect(x,y,13+i%3*7,13+i%3*7,1,['#ef9e83','#f8d884','#7ebbaa','#a37ab4'][i%4]);}).join(''),'Raro');

group('manos','Guantes','fur','238 599 548 153','Sin guantes');
const gloves = (color,shadow,cuff) => mirror(path('M278 644L312 604Q339 607 351 627L333 665Q351 684 341 711Q331 741 307 747Q289 746 278 735Q260 736 253 726Q239 721 243 706Q232 693 244 683Q235 669 249 659Q260 649 278 657Z',color,9)
  +fillPath('M299 735Q323 716 325 694L340 676Q346 703 329 725Q315 745 299 735Z',shadow)
  +path('M276 644L299 610L349 631L332 664Z',cuff,8)+path('M255 680L278 688M254 705L276 709','none',6));
add('manos','blancos','Guantes blancos',gloves('#fff6df','#d8cebc','#f4e9ce'));
add('manos','tela','Mitones tejidos',gloves('#a56d88','#794e6d','#ddb0bf'));
add('manos','jardin','Guantes de jardín',gloves('#82a77a','#55744f','#e8c17f'));
add('manos','neon','Guantes de neón',gloves('#4c4d79','#343356','#a3ddc5'),'Poco común');
add('manos','cristal','Guantes facetados',gloves('#8de1d8','#5aa6b3','#ccf4e1'),'Raro');
add('manos','querubin','Guantes de luz',gloves('#f9e9be','#d7bfad','#ffdfa3'),'Secreto');

add('ojos','curiosos','Mirada curiosa',mirror(oval(451,321,29,41,white,ink)+oval(455,326,15,24,ink)+oval(450,316,7,9,'#fff'))+path('M424 284Q448 258 478 280M548 280Q570 271 600 290','none',9));
add('ojos','relajados','Mirada relajada',mirror(path('M424 314Q449 326 478 312L471 334Q447 353 428 332Z',white,7)+oval(453,329,9,12,ink)));
add('ojos','pestanas','Pestañas curvas',brows()+openEyes(35,ink)+mirror(path('M425 307L416 300M428 296L421 287','none',6)));
add('ojos','estrellados','Ojos estrellados',brows()+mirror(oval(451,321,27,36,white,ink)+star(451,322,1.13,'#9c6e9b')+oval(450,317,5,6,'#fff')),'Poco común');
add('ojos','corazon','Ojos de corazón',brows()+mirror(oval(451,321,27,36,white,ink)+heart(451,320,.65,'#c5577c')),'Poco común');
add('ojos','esmeralda','Mirada esmeralda',brows()+openEyes(38,'#326f56'),'Poco común');
add('ojos','pixel','Ojos de píxel',mirror(rect(423,292,53,64,0,white,ink,7)+rect(444,311,22,37,0,ink)+rect(446,311,8,11,0,'#fff')),'Raro');
add('ojos','luz','Mirada luminosa',brows()+openEyes(37,'#ac7944')+mirror(star(450,322,.73,'#ffe495')),'Secreto');
add('boca','ladina','Sonrisa de lado',path('M465 422Q517 453 566 407M552 407Q565 400 573 411','none',9));
add('boca','dientito','Sonrisa con dientito',path('M468 415Q514 439 559 413Q548 453 511 453Q486 453 468 415Z','#763d43',8)+path('M494 428L519 432L515 448L495 446Z',white,5));
add('boca','silbido','Silbido',oval(530,428,21,16,'#844c44',ink,7)+path('M500 433L475 444M501 416L474 414','none',5,'#aa6648'));
add('boca','serena','Sonrisa serena',path('M480 428Q511 449 545 427','none',7));
add('boca','sonrisa-ancha','Sonrisa de reto',path('M458 413Q516 430 570 404Q562 444 510 450Q474 451 458 413Z',white,8)+path('M476 431Q522 442 558 421','none',5),'Poco común');
add('boca','puchero','Puchero',path('M482 437Q511 406 542 433M512 418L513 407','none',7));
add('boca','gato','Sonrisa de gatito',path('M474 416Q483 438 512 419Q538 438 550 412','none',8),'Poco común');
add('boca','asombro','Asombro',oval(512,429,28,25,'#733e43',ink,7)+oval(513,441,16,8,'#ef9b83'),'Poco común');
add('cara','bigote-saltarin','Bigote rizado',path('M512 403Q487 378 461 398Q436 414 418 397Q423 433 458 438Q491 441 512 416Q534 441 566 438Q601 433 606 397Q588 414 563 398Q537 378 512 403Z','#4b2d29',7),'Poco común');
add('cara','estrellas','Lentes de estrella',mirror(move(440,318,path('M0-43L14-15L45-10L22 10L26 44L0 27L-28 44L-23 10L-45-10L-14-15Z','#e9b777',8)+star(-6,-6,.95,'#f8e7b5')))+path('M484 314Q512 289 540 314','none',10),'Raro');
add('cara','cicatriz-color','Curita de color',move(396,360,`<g transform="rotate(-15)">${rect(-29,-13,58,26,8,'#eed4a4',ink,5)+rect(-9,-8,18,16,3,'#cf9a8d')}</g>`));
add('cara','monte','Gafas de sendero',glasses('#acd5bc','#466e5e')+mirror(path('M420 310L447 300','none',7,'#eef1cc')),'Poco común');
add('cara','visera-pixel','Visor cuadriculado',path('M361 277H663V327H642V354H583V337H556V319H468V337H441V354H382V327H361Z','#354b73',8)
  +mirror(path('M397 301H430V319H454','none',9,'#8af0d6')),'Épico');
add('marcas','estela-mejilla','Estrellitas en las mejillas',mirror(star(392,353,.9,'#e99c64')+star(415,365,.5,'#e9be7b')),'Poco común');
add('marcas','pixel-puntos','Mejillas pixeladas',mirror(rect(378,340,18,18,0,'#cb7873')+rect(401,357,14,14,0,'#d78d73')));
add('marcas','nasal','Pecas doradas',mirror(oval(385,351,8,8,'#987861')+oval(407,356,7,7,'#a98864')));
add('marcas','chispas','Mejillas de chispa',mirror(oval(394,355,26,16,'#e77a68')+star(398,347,.53,'#fff0a7')),'Raro');

add('peinado','copete','Copete miel',path('M359 244Q356 175 410 137Q457 102 488 110Q531 61 608 104Q576 118 582 147Q662 154 665 241Q620 249 588 216Q540 251 478 236Q412 256 359 244Z','#a86c42',11)
  +path('M397 220Q437 172 498 162M515 147Q551 117 580 119','none',9,'#d9a766'));
add('peinado','rizado-menta','Rizos menta',path('M353 221Q331 181 369 162Q359 127 399 111Q428 96 452 116Q472 87 508 104Q537 83 563 121Q599 101 625 128Q654 142 650 174Q688 187 671 222Q660 251 623 243Q593 254 560 229Q523 248 486 228Q453 254 419 233Q376 254 353 221Z','#7ba48a',11)
  +path('M378 179Q402 147 426 165M473 157Q500 137 520 153M558 162Q583 143 604 168','none',9,'#bce0aa'),'Poco común');
add('cabeza','gorra-crema','Gorra crema',path('M366 233Q344 158 411 128Q506 78 602 122Q655 144 662 211L725 237Q736 252 710 267Q650 280 588 249Q457 241 366 258Z','#e2cb99',11)
  +path('M399 200Q428 147 478 136M564 243Q610 218 658 212','none',8,'#a78362'));
add('cabeza','panal','Gorro de abeja',path('M357 224Q359 115 508 102Q655 112 667 225Z','#e9b950',11)
  +path('M371 171Q507 137 651 171L658 198Q503 173 364 201Z','#785343',8)
  +mirror(path('M411 135Q404 97 380 77','none',10)+oval(373,69,16,16,'#eab459',ink,7))
  +path('M353 222Q513 192 672 222L667 251Q514 224 359 251Z','#fae199',9),'Poco común');
add('cabeza','orejas-zorro','Capucha de piloto ámbar',path('M358 250Q347 200 375 158L363 67L440 117Q514 94 584 117L661 67L649 158Q678 203 666 250L622 263Q515 223 403 263Z','#db8048',12)
  +mirror(path('M382 97L418 121L390 143Z','#f8dc9f',7))
  +path('M384 220Q512 171 639 220','none',24,'#5a494c')
  +mirror(rect(390,193,98,49,15,'#99cfcd',ink,8)+path('M404 217L431 207','none',7,'#eaf8db')),'Épico');
add('cabeza','esponja-rosa','Capucha estelar rosa',path('M357 271Q313 225 346 150Q393 72 512 71Q631 72 678 150Q711 225 667 271L639 258Q646 206 616 181Q562 151 512 154Q462 151 408 181Q378 206 385 258Z','#e69abf',12)
  +path('M372 171Q411 105 475 100','none',9,'#ffe2df')+star(514,116,1.58,'#ffde83'),'Raro');
add('cabeza','bloque-piedra','Casco de mineral facetado',path('M344 239V146L395 95H630L681 146V239H640V265H384V239Z','#69c4ba',11)
  +path('M344 146L396 95H630L681 146H623V171H400V147Z','#b9e9c9',8)
  +path('M623 171H674V231H630V255H589V214H623Z','#458c96',6)+rect(502,184,25,44,0,'#c5f0cf'),'Épico');
add('cabeza','seto-cubico','Capucha de seto cúbico',path('M343 270V142L397 92H628L681 142V270H638V226H606V202H419V226H386V270Z','#79a253',11)
  +path('M345 145L395 96H628L678 145H620V172H400V146Z','#a1bf68',8)
  +rect(392,152,26,21,0,'#4f7446')+rect(447,111,36,20,0,'#cee084')+rect(595,152,39,27,0,'#557b47'),'Raro');
add('cabeza','halo','Halo aurora',oval(512,106,181,50,'none','#f9db8e',25)+oval(512,104,180,48,'none','#fff2bb',11)
  +star(512,105,1.66,'#fff6d4'),'Secreto');

add('torso','camisa-cubica','Camiseta turquesa de bloques',shirt('#428f95','#36778a')
  +path('M420 467H463V488H562V467H607M399 546H423V570H451','none',11,'#75c9b8'),'Poco común');
add('torso','mineral','Coraza de mineral facetado',shirt('#516a86','#394c6e')
  +path('M395 493H454V523H569V493H628V581H613V664H563V700H460V671H413V585H395Z','#6bc6b9',10)
  +path('M421 520H476V548H551V521H609V557H576V600H450V557H421Z','#a5e0c0',7),'Épico');
add('torso','seto','Sudadera de musgo',shirt('#648948','#49613f')
  +path('M410 537H447V562H477V594H427V571H410ZM550 586H591V560H619V613H579V640H550Z','#9fbe68',7)
  +path('M455 504L471 543M569 503L553 543','none',8,'#e1d79f'),'Raro');
add('torso','rosa-estelar','Sudadera de nube rosa',shirt('#eb9fc4','#bd739d')
  +path('M420 474Q513 514 604 474','none',20,'#ffcfd5')
  +star(514,573,2.3,'#ffe397')+path('M460 661H560','none',10,'#ffb9cd'),'Raro');
add('torso','bata-arcade','Túnica arcade',shirt('#555194','#42386e')
  +path('M420 474L511 533L603 474L591 503L512 564L431 506Z','#8e70bd',7)
  +path('M398 668H625','none',18,'#f0ba69')+star(511,587,1.55,'#f4c972'),'Raro');
add('torso','aurora','Túnica aurora',path('M423 451L464 452Q511 487 560 452L603 451L657 515L623 556L609 540L632 678Q516 754 392 678L417 540L400 558L366 515Z','#fff3dc',12)
  +path('M445 470Q516 511 579 470L570 504Q511 537 454 504Z','#e4be75',8)
  +path('M402 663Q513 732 622 663L628 689Q515 757 397 689Z','#d5a4b5',8)
  +star(512,573,2.32,'#f2bf69'),'Secreto');
add('chaleco','parches','Chaleco de parches',mirror(vest('#9b7859','#705747','#dac49b')+rect(394,566,45,47,8,'#be9270',ink,6)),'Poco común');
add('cintura','lazo','Lazo de cintura',path('M383 660Q512 690 641 659L638 693Q512 724 385 694Z','#a66c8f',8)
  +path('M498 680L439 653L432 707L496 697H529L586 707L593 653L528 680Z','#cf94aa',8)+rect(493,673,39,31,9,'#e0aaba',ink,7));
add('cuello','panolito','Pañuelo blanco de pista',path('M398 455Q510 488 625 452L628 488Q548 530 493 529L475 549L456 526Q425 523 390 490Z','#fff6e0',9)
  +path('M416 477Q512 523 603 476','none',7,'#d6c6b4'),'Poco común');
add('cuello','verde-lima','Bufanda lima',path('M397 455Q512 485 625 453L635 492Q581 526 544 516L576 609L523 622L490 524Q433 518 389 492Z','#a2b873',10)
  +path('M422 466L412 499M465 476L454 516M527 548L554 537M536 579L566 568','none',8,'#e2db9b'));
add('espalda','pua-carrera','Púas de carrera',mirror(path('M411 494Q330 467 253 480Q279 526 306 553L231 565Q264 613 306 635L260 660Q319 713 399 705L454 635Z','#2673b7',12)
  +path('M276 499L341 524M254 575L348 601M285 665L352 666','none',9,'#76b4e2')),'Raro');
add('espalda','hoja','Hoja de excursión',path('M430 473Q334 473 286 426Q260 531 318 601Q349 633 393 656L407 736L477 723L507 607Z','#83a563',11)
  +path('M301 455Q339 550 414 627M336 526L364 506M357 562L327 560','none',8,'#bed38a'),'Poco común');
add('espalda','alas-aurora','Alas aurora',mirror(path('M476 535Q349 441 195 438Q129 438 112 488Q178 504 215 554L136 556Q157 617 233 644L167 659Q222 733 322 730L281 767Q385 792 456 703Z','#fff7df',13)
  +fillPath('M125 480Q244 490 309 578Q364 646 447 675L450 700Q397 768 304 760L344 727Q237 729 177 662L254 647Q175 611 148 564L234 561Z','#e5bad5')
  +path('M155 486Q297 516 357 620M174 567Q271 592 327 649M222 667Q284 678 351 690','none',9,'#e2bd85')
  +star(221,530,1.25,'#fff1ad')),'Secreto');
add('mano','aro-dorado','Aro de carrera',move(245,675,oval(0,0,49,65,'none',ink,26)+oval(0,0,49,65,'none','#e7a736',17)+path('M-39-30Q-24-59-4-57','none',8,'#ffe88e')),'Raro');
add('mano','planta-pixel','Brote pixelado',path('M239 653V618H270V644H290V602H310V644H325V665H277V686H253V655Z','#78a65b',7)
  +path('M234 669H320V692H311V738H246V692H234Z','#b57a56',8)+rect(250,711,39,15,0,'#d49867'),'Poco común');
add('mano','estrella-salto','Estrella de salto',move(261,688,path('M0-60L16-22L57-18L27 10L38 52L0 31L-38 52L-27 10L-57-18L-16-22Z','#f4c865',9)+star(-8,-13,1.33,'#fff1a1')),'Raro');
add('mano','linterna-bloques','Farol de bloques',path('M240 643V620H294V643','none',9)+rect(221,643,94,92,0,'#665955',ink,8)
  +rect(235,656,66,62,0,'#efc367',ink,6)+rect(252,673,33,30,0,'#fff0a3'),'Poco común');
add('mano','burbujas','Pompas de jabón',move(274,681,path('M-18 58L-9 10','none',9,'#946c89')+oval(-5,-12,20,27,'none','#a370ae',9)
  +oval(-19,-68,23,23,'#b7ded8','#6c9da2',6)+oval(20,-111,34,34,'#c7dedc','#6c9da2',6)+path('M13-129Q23-135 33-122','none',6,'#f3f5dc')),'Poco común');
add('mano','microfono','Micrófono retro',move(266,687,`<g transform="rotate(-25)">${rect(-18,-35,36,99,11,'#645a76',ink,8)+oval(0,-40,37,39,'#bfc2bf',ink,8)+path('M-28-52H28M-30-38H30M-23-24H23','none',6)}</g>`));
add('mano','mapa-cubico','Mapa cuadriculado',path('M185 618H323V731H185Z','#eee0ae',9)
  +path('M198 642H225V664H251V646H277V682H313M201 693H226V709H256','none',11,'#6b9b74')
  +rect(275,690,18,18,0,'#c27266'),'Poco común');
add('mano','flor-luna','Flor de luz',move(256,679,path('M8 62L0-20','none',10,'#7fa182')+oval(-20,22,25,13,'#9cba86',ink,5)+star(0,-33,3,'#f9d889')+star(0,-33,1.66,'#fff3cb')),'Secreto');

add('pantalon','azul-peto','Pantalón de peto azul',trousers('#395ca7','#30477b','#91a5d2')
  +mirror(path('M392 760L435 766L441 806L396 810Z','#4b79b3',7)),'Poco común');
add('pantalon','obrero-bloques','Pantalón índigo cuadriculado',trousers('#555a92','#3f456c','#a29cc3')
  +mirror(path('M396 758H422V786H445V816H411V791H396Z','#777bac',6)));
add('pantalon','rosa-nube','Pantalón de nube rosa',trousers('#e39ab7','#b975a2','#f8cada',873,false),'Poco común');
add('pies','carrera-roja','Tenis rojos con banda blanca',sneaker('#df4b48','#ab3748','#fff1dd','#fae5cb')
  +mirror(path('M395 901L414 892L463 920L446 932Z','#fff2da',6)+rect(420,907,24,17,4,'#eeba64',ink,5)),'Raro');
add('pies','salto-cereza','Zapatos cereza',sneaker('#d65872','#9e4263','#f4d3ac','#fff0d4'),'Poco común');
add('pies','mineral','Botas de mineral facetado',boot('#69bdb5','#459195')
  +mirror(path('M382 816H478V843H453V864H398V841H382Z','#afe3c6',7)),'Épico');
add('pies','sandalias-aurora','Sandalias doradas',sneaker('#e5c18b','#cba374','#fff0d0','#fff5d9'),'Secreto');

add('fondo','pradera-retro','Pradera de cuadros',horizon('#c5e9ed','#80b783','#c59d68','#a7cc96')
  +path('M0 857H1024','none',36,'#6ba967')
  +Array.from({length:20},(_,i)=>rect((i%5)*205+(Math.floor(i/5)%2)*102,877+Math.floor(i/5)*46,102,46,0,'#ab805a')).join('')
  +cloud(155,237,1.38,'#f8f6dc')+cloud(832,280,1.25,'#f8f6dc'),'Raro');
add('fondo','tuberias','Valle de tuberías',horizon('#cce7e5','#8fb286','#cbab79','#acd09b')
  +[150,835].map((x,i)=>rect(x,635+i*35,87,205,0,'#559470',ink,7)+rect(x-10,618+i*35,108,47,5,'#79b582',ink,6)).join('')
  +[130,804,875].map((x,i)=>rect(x,378+i*27,64,54,4,'#c7885c',ink,5)+path(`M${x+8} ${405+i*27}h48`,'none',5,'#ebbb77')).join(''),'Poco común');
add('fondo','nube-rosa','Valle de nubes dulces',horizon('#edd7e9','#a6a7c8','#ccb1d2','#c6bad6')
  +cloud(145,303,1.5,'#fff1e4')+cloud(895,323,1.31,'#fff1e4')+star(813,239,4,'#ffdfa3'),'Raro');
add('fondo','amanecer-aurora','Santuario aurora',horizon('#e6d4ed','#baaece','#d6bed5','#c8bcdc')
  +oval(512,380,292,285,'#f3dcbe')
  +cloud(128,709,1.55,'#fff0df')+cloud(865,740,1.65,'#fff0df')+cloud(164,441,1.24,'#fff3df')+cloud(861,421,1.19,'#fff3df')
  +[ [151,274],[881,186],[246,159],[799,466],[104,556] ].map(([x,y],i)=>star(x,y,1.4+i%2,'#fff7d4')).join(''),'Secreto');
add('marco','aurora','Marco de alabastro',frame('#e1bf8d','#fff5d9')+mirror(star(73,77,2.7,'#fff2c1')+star(96,943,1.65,'#f5d6d9')),'Secreto');
add('efecto','aureola','Lluvia de luz',Array.from({length:18},(_,i)=>{const angle=i*Math.PI/9;return star(Math.round(512+390*Math.sin(angle)),Math.round(513+402*Math.cos(angle)),i%2?1.18:1.76,i%2?'#ffe4a3':'#fff7d8');}).join(''),'Secreto');
add('efecto','hojas','Hojas al viento',[[165,403],[116,653],[869,174],[889,615],[776,827]].map(([x,y],i)=>move(x,y,path('M-14 18Q-28-15 21-22Q20 8-14 18Z','#e1bd74',5,'#7b7951'),i%2?1.22:.98)).join(''),'Poco común');
add('espalda','alas-neon','Alas holográficas',mirror(path('M446 536L309 470L185 436L220 553L169 554L260 660L236 700L392 740L469 662Z','#7d88be',11)
  +path('M191 444L309 493L424 549L384 606L220 553L262 538Z','#a5dad6',8)+path('M233 607L357 650L414 667L395 725L258 694Z','#ba94cf',8)),'Legendario');
add('cabeza','meteoro','Corona de meteoros',path('M365 224L352 149L417 164L448 116L483 142L512 85L541 142L576 116L607 164L672 149L659 224Z','#dfad5a',11)
  +path('M369 205Q512 181 656 205','none',10,'#fff0a2')+move(512,160,path('M0-24L19 0L0 27L-19 0Z','#9ad7bf',6))
  +mirror(star(421,137,1,'#ffe38c')),'Legendario');
add('mano','reloj-tiempo','Reloj solar de bolsillo',move(264,689,oval(0,0,66,65,'#d79e5c',ink,9)+oval(0,0,49,49,'#f5e5b5',ink,6)
  +path('M0-34V-24M0 24V34M-34 0H-24M24 0H34M0-26V2L17 17','none',7,'#52566b')+star(0,0,.55,'#d4825d')),'Legendario');
add('efecto','cuadros-neon','Aura neón cuadriculada',[[136,224],[845,270],[109,484],[910,575],[160,818],[831,832]].map(([x,y],i)=>
  move(x,y,rect(-24,-24,48,48,5,'none',i%2?'#e0a7f5':'#83d9ce',9)+star(0,0,1.53,i%2?'#f9c9eb':'#bdfff0'))).join(''),'Legendario');
add('marco','circuito','Marco de circuito dorado',frame('#af8062','#ead59a')+mirror(path('M91 248V135H190V87H284M60 779H123V873H219V935','none',12,'#f4e0a3')
  +[ [91,248],[284,87],[219,935] ].map(([x,y])=>oval(x,y,12,12,'#f3c879')).join('')),'Legendario');

// Los secretos anteriores siguen disponibles como cosméticos de rareza alta.
for(const [id,key] of [['cabeza','mago'],['cabeza','bloques'],['cabeza','hongo'],['pelaje','lila'],['efecto','corazones']]) {
  choices[id].items.find(item=>item.id===key).rarity='Épico';
}

export const catalog = choices;
export const sections = [
  {name:'Rostro',icon:'eyes',groups:['pelaje','cuernos','color-cuernos','ojos','boca','marcas']},
  {name:'Cabeza',icon:'helmet',groups:['cabeza','peinado','cara']},
  {name:'Ropa',icon:'shirt',groups:['torso','pantalon','chaleco','cintura','cuello','pies','manos']},
  {name:'Accesorios',icon:'backpack',groups:['espalda','mano']},
  {name:'Escena',icon:'landscape',groups:['fondo','marco','efecto']},
  {name:'Kits',icon:'kits',groups:['nuevos','todos','pantalla','videojuegos','cotidianos']}
];
export const defaults = {pelaje:'caramelo',cuernos:'enrollados','color-cuernos':'ocre',ojos:'redondos',boca:'risa',marcas:'ninguno',cabeza:'casco-verde',peinado:'ninguno',cara:'ninguno',torso:'verde',pantalon:'cargo',chaleco:'brigadista',cintura:'ninguno',espalda:'ninguno',cuello:'ninguno',mano:'ninguno',manos:'ninguno',pies:'ninguno',fondo:'cerro',marco:'ninguno',efecto:'ninguno'};
export const find = (group,id) => catalog[group]?.items.find(item=>item.id===id);
export function normalize(state) {
  return Object.fromEntries(Object.entries(defaults).map(([id,value])=>[id,find(id,state?.[id])?.id ?? value]));
}
export function assemble(state,{showPants=true,layerIds=true}={}) {
  const s=normalize(state);
  const [,fur,shadow,light]=palette[s.pelaje];
  const art = group => find(group,s[group]).art;
  const layer = (id,artwork) => artwork ? `<g${layerIds?` id="${id}"`:''}>${artwork}</g>` : '';
  return [
    layer('fondo',art('fondo')), layer('espalda',art('espalda')),
    layer('piernas',mirror(leg(fur,shadow))), layer('brazo-derecho',arm(fur,shadow)),
    layer('brazo-izquierdo',`<g transform="translate(1024 0) scale(-1 1)">${arm(fur,shadow)}</g>`),
    layer('cuerpo',trunk(fur,shadow,light)),layer('calzado',art('pies')),layer('pantalon',showPants?art('pantalon'):''),
    layer('torso',art('torso')),layer('chaleco',art('chaleco')),layer('cintura',art('cintura')),layer('cuello',art('cuello')),
    layer('cabeza',head(fur,shadow)+muzzle(light)),layer('peinado',art('peinado')),layer('marcas',art('marcas')),
    layer('ojos',art('ojos')),layer('boca',art('boca')),layer('accesorio-cara',art('cara')),
    layer('cuernos',horns(s.cuernos,hornColors[s['color-cuernos']])),
    layer('sombrero',art('cabeza')),layer('guantes',art('manos')),layer('mano-derecha',art('mano')),
    layer('efecto',art('efecto')),layer('marco',art('marco'))
  ].join('');
}
const outfit = {...defaults,chaleco:'ninguno'};
const kit = (id,name,category,description,changes,base=outfit) =>
  ({id,name,category,description,state:{...base,...changes}});
export const kitCategories = {nuevos:'Nuevos',todos:'Todos',pantalla:'Series y memes',videojuegos:'Videojuegos',cotidianos:'Vida diaria'};
const screenKits = [
  kit('doble-t','Doble T','pantalla','Silueta de tronco, vetas y una baqueta de percusión.',{pelaje:'canela',cuernos:'cortos',ojos:'redondos',marcas:'vetas',cabeza:'madera-resonante',torso:'madera-resonante',pantalon:'duelas',mano:'baqueta',pies:'cobre',fondo:'tablado',efecto:'ritmo'}),
  kit('bailarina-expresso','Bailarina Expresso','pantalla','Taza de porcelana con espuma, tutú rosa y zapatillas con cintas.',{pelaje:'nieve',cuernos:'cortos','color-cuernos':'dorado',ojos:'redondos',boca:'sonrisa',marcas:'rubor',cabeza:'taza-expresso',torso:'expresso',pantalon:'leggings',cintura:'tutu',pies:'danza',fondo:'escenario-lila',efecto:'brillo'}),
  kit('rey-pirata','Rey Pirata','pantalla','Sombrero de paja con cinta roja, chaleco abierto y faja dorada.',{pelaje:'caramelo',ojos:'alegres',marcas:'mejilla-marina',cabeza:'sombrero-marea',peinado:'fleco-marino',torso:'marea',pantalon:'marea',cintura:'faja-oceano',mano:'catalejo',pies:'chanclas',fondo:'marea'}),
  kit('super-alien','Super Alien','pantalla','Puntas doradas, uniforme naranja y una esfera de energía azul.',{pelaje:'canela',cuernos:'cortos','color-cuernos':'dorado',ojos:'decididos',boca:'sonrisa',cabeza:'ninguno',peinado:'llama-astral',torso:'alien-astral',pantalon:'astral',mano:'orbe-astral',pies:'botas-astrales',fondo:'aurora',efecto:'chispa-astral'}),
  kit('ninja-rubio','Ninja Rubio','pantalla','Mechones rubios, banda con placa y uniforme naranja con paneles oscuros.',{pelaje:'arena',cuernos:'cortos',ojos:'almendrados',boca:'sonrisa',marcas:'rayas-viento',cabeza:'banda-amanecer',peinado:'rubio',torso:'ninja-viento',pantalon:'rastro',cintura:'riñonera',mano:'pergamino',pies:'ninja',fondo:'cielo-ninja'}),
  kit('soldado-espacial','Soldado Espacial','videojuegos','Casco angular con visor ámbar y armadura verde oliva.',{pelaje:'piedra',cuernos:'cortos','color-cuernos':'plata',ojos:'decididos',boca:'sonrisa',cabeza:'casco-espacial',torso:'espacial-centinela',pantalon:'centinela',pies:'centinela',mano:'sonda',fondo:'hangar'}),
  kit('futbolista','Futbolista','cotidianos','Camiseta rayada con el dorsal 10, tacos y balón clásico.',{pelaje:'canela',ojos:'guiño',cabeza:'ninguno',peinado:'rizos',torso:'futbol-costa',pantalon:'futbol',mano:'balon',pies:'medias-futbol',fondo:'cancha'}),
  kit('circo-de-pixeles','Circo de Píxeles','pantalla','Gorro de bufón rojo y azul, cascabeles y carpa a cuadros.',{pelaje:'nieve',cuernos:'cortos','color-cuernos':'dorado',ojos:'sorprendidos',marcas:'circo',cabeza:'gorro-circo',torso:'circo-pixel',pantalon:'circo',mano:'pelotas-circo',pies:'lona',fondo:'circo-pixel',efecto:'confeti'})
];
export const newKits = [
  kit('erizo-de-tormenta','Erizo de tormenta','videojuegos','Púas hacia atrás, guantes blancos, tenis rojos y aro dorado.',{pelaje:'cobalto',cuernos:'cortos','color-cuernos':'plata',ojos:'esmeralda',boca:'ladina',cabeza:'pua-azul',torso:'sprint',pantalon:'velocidad',espalda:'pua-carrera',manos:'blancos',mano:'aro-dorado',pies:'carrera-roja',fondo:'pradera-retro',efecto:'velocidad'}),
  kit('maestro-del-taller','Plomero Saltarín','videojuegos','Gorra roja lisa, bigote rizado, peto azul y una estrella de salto.',{cabeza:'boina-taller',cara:'bigote-saltarin',torso:'taller',pantalon:'azul-peto',manos:'blancos',mano:'estrella-salto',pies:'cobre',fondo:'tuberias'}),
  kit('minero-de-bloques','Minero de bloques','videojuegos','Camiseta turquesa, pantalón índigo y farol de píxeles.',{pelaje:'canela',ojos:'pixel',marcas:'pixel-puntos',cabeza:'ninguno',torso:'camisa-cubica',pantalon:'obrero-bloques',mano:'linterna-bloques',pies:'pixel',fondo:'cantera',efecto:'cuadritos'}),
  kit('guardian-facetado','Guardián facetado','videojuegos','Casco, coraza y botas color aguamarina con formas de bloque.',{pelaje:'piedra',ojos:'pixel',cabeza:'bloque-piedra',torso:'mineral',pantalon:'obrero-bloques',mano:'gemacubica',manos:'cristal',pies:'mineral',fondo:'cantera',marco:'pixel',efecto:'cuadritos'}),
  kit('criatura-de-musgo','Criatura de musgo','videojuegos','Capucha cúbica verde, ojos de píxel y brote en maceta.',{pelaje:'menta',cuernos:'cortos',ojos:'pixel',boca:'puchero',cabeza:'seto-cubico',torso:'seto',pantalon:'obrero-bloques',mano:'planta-pixel',pies:'pixel',fondo:'cantera',efecto:'cuadritos'}),
  kit('vigia-del-bosque','Vigía del bosque','videojuegos','Gorro verde puntiagudo, túnica de excursión y mapa.',{pelaje:'arena',marcas:'pecas',cabeza:'exploracion',peinado:'copete',torso:'guardabosques',pantalon:'lona',espalda:'hoja',mano:'cartografia',pies:'montana',fondo:'bosque',efecto:'hojas'}),
  kit('chispa-amarilla','Chispa amarilla','videojuegos','Puntas oscuras, mejillas de chispa y relámpagos.',{pelaje:'arena',cuernos:'cortos',ojos:'alegres',marcas:'chispas',cabeza:'gorro-claraboya',torso:'claraboya',pantalon:'jogger',pies:'lona',fondo:'cerro',efecto:'electricidad'}),
  kit('saltos-lunares','Saltos lunares','videojuegos','Capucha redonda rosa, zapatos cereza y estrella brillante.',{pelaje:'lila',cuernos:'cortos',ojos:'curiosos',boca:'asombro',marcas:'rubor',cabeza:'esponja-rosa',torso:'rosa-estelar',pantalon:'rosa-nube',mano:'estrella-salto',pies:'salto-cereza',fondo:'nube-rosa'}),
  kit('navegante-orbital','Navegante orbital','videojuegos','Propulsor, traje de tripulación y visor brillante.',{pelaje:'piedra',cuernos:'cortos','color-cuernos':'plata',ojos:'decididos',cabeza:'visor-nave',cara:'visera-pixel',torso:'navegante',pantalon:'orbital',espalda:'jetpack',mano:'sonda',pies:'orbital',fondo:'luna'}),
  kit('piloto-de-nubes','Piloto de nubes','videojuegos','Capucha de zorro, gafas de vuelo y pañuelo blanco.',{pelaje:'canela',cabeza:'orejas-zorro',torso:'aviacion',cuello:'panolito',pantalon:'lona',mano:'brujula',pies:'cobre',fondo:'arcoiris',marco:'nubes'}),
  kit('mago-de-arcade','Mago de arcade','videojuegos','Túnica, gorro de estrellas y corazones de píxel.',{pelaje:'lila','color-cuernos':'dorado',ojos:'estrellados',cabeza:'mago',torso:'bata-arcade',pantalon:'jogger',mano:'control',pies:'lona',fondo:'cantera',efecto:'corazones'})
];
export const secretKit = kit('cimarron-angelical','Cimarrón Angelical','secreto','Alas nacaradas, halo dorado y santuario de nubes.',{pelaje:'nieve',cuernos:'espiral','color-cuernos':'dorado',ojos:'luz',boca:'serena',cabeza:'halo',torso:'aurora',pantalon:'rosa-nube',espalda:'alas-aurora',manos:'querubin',mano:'flor-luna',pies:'sandalias-aurora',fondo:'amanecer-aurora',marco:'aurora',efecto:'aureola'});
export const kits = [
  ...newKits,
  ...screenKits,
  kit('brigadista','Brigadista Cimarrón','cotidianos','Casco verde, chaleco reflejante y pantalón cargo.',{},defaults),
  kit('lluvia','Listo para la lluvia','cotidianos','Capucha amarilla, pantalón de lona y botas de agua.',{cabeza:'capucha',torso:'lluvia',pantalon:'lona',mano:'paraguas',pies:'botas-lluvia',fondo:'tijuana',efecto:'lluvia'}),
  kit('playa','Tarde en Rosarito','cotidianos','Sombrero Panamá, bermudas y cometa de papel.',{cabeza:'panama',cara:'sol',torso:'futbol',pantalon:'bermudas',mano:'cometa',pies:'chanclas',fondo:'playa'}),
  kit('invierno','Paseo de invierno','cotidianos','Gorro tejido, suéter y termo.',{pelaje:'nieve',cabeza:'gorrito-punto',torso:'tejido',cuello:'bufanda-ocre',pantalon:'termico',mano:'termo',pies:'nieve',fondo:'nublado'}),
  kit('campus','Un día en el campus','cotidianos','Sombrero de pescador, jeans y tenis de lona.',{cabeza:'pescador',cara:'montura',torso:'sudadera-avena',pantalon:'mezclilla',espalda:'rollo',mano:'libro',pies:'lona',fondo:'campus'}),
  secretKit
];
export const svg = (art, view='0 0 1024 1024', size=1024) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${view}" width="${size}" height="${size}" preserveAspectRatio="xMidYMid meet">${art}</svg>`;

export function standaloneParts() {
  const parts={};
  for(const [id,[,fur,shadow,light]] of Object.entries(palette)) {
    parts[`base/${id}/piernas`]=mirror(leg(fur,shadow));
    parts[`base/${id}/cuerpo`]=trunk(fur,shadow,light);
    parts[`base/${id}/cabeza`]=head(fur,shadow)+muzzle(light);
    parts[`base/${id}/brazo-derecho`]=arm(fur,shadow);
    parts[`base/${id}/brazo-izquierdo`]=`<g transform="translate(1024 0) scale(-1 1)">${arm(fur,shadow)}</g>`;
  }
  for(const shape of Object.keys(hornShape)) for(const [color,tones] of Object.entries(hornColors)) parts[`cuernos/${shape}-${color}`]=horns(shape,tones);
  for(const group of Object.values(catalog)) {
    if(['cuernos','color-cuernos','pelaje'].includes(group.id)) continue;
    for(const item of group.items) if(item.art) parts[`${group.id}/${item.id}`]=item.art;
  }
  return parts;
}
