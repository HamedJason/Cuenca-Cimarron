<?php

namespace App\Support;

// Filtro simple de groserías en español para los comentarios de Comunidad Cimarrona.
// No borra nada: el comentario se guarda oculto y la calificación sí cuenta.
class Groserias
{
    // Palabras completas, ya sin acentos y sin letras repetidas.
    private const PALABRAS = [
        'pendejo', 'pendeja', 'pendejos', 'pendejas', 'pendejada', 'pendejadas', 'pendejete',
        'chinga', 'chingas', 'chingar', 'chingada', 'chingado', 'chingadera', 'chingaderas', 'chingon', 'chingona',
        'chingue', 'chingues', 'chingate', 'chingatelo', 'chingamadre', 'chinguen',
        'verga', 'vergas', 'vergazo', 'verguiza', 'puto', 'puta', 'putos', 'putas', 'putazo', 'putiza', 'putada',
        'putisimo', 'hijueputa', 'hdp', 'culero', 'culera', 'culeros', 'culeras', 'culo', 'culos',
        'cabron', 'cabrona', 'cabrones', 'cabronas', 'mamon', 'mamona', 'mamones', 'mamada', 'mamadas', 'mames',
        'pinche', 'pinches', 'joto', 'jotos', 'maricon', 'maricona', 'maricones', 'mierda', 'mierdas',
        'cagada', 'cagadas', 'estupido', 'estupida', 'estupidos', 'estupidas', 'idiota', 'idiotas',
        'imbecil', 'imbeciles', 'pija', 'malparido', 'malparida', 'ojete', 'ojetes',
        'jodete', 'joder', 'jodido', 'jodida', 'baboso', 'babosa', 'naco', 'naca', 'mensa', 'menso',
        'tarado', 'tarada', 'nalgas', 'chichis', 'panocha', 'pndj', 'ptm', 'alv',
    ];

    public static function contiene(string $texto): bool
    {
        $texto = mb_strtolower($texto);
        if (preg_match('~https?://|www\.|\.(com|net|org|mx|xyz|ru)\b~', $texto)) {
            return true;
        }
        $texto = strtr($texto, [
            'á' => 'a', 'é' => 'e', 'í' => 'i', 'ó' => 'o', 'ú' => 'u', 'ü' => 'u', 'ñ' => 'n',
            '0' => 'o', '1' => 'i', '3' => 'e', '4' => 'a', '@' => 'a', '$' => 's', '5' => 's', '7' => 't',
        ]);
        $lista = array_flip(array_map([self::class, 'sinRepetidas'], self::PALABRAS));
        foreach (preg_split('~[^a-z]+~', $texto, -1, PREG_SPLIT_NO_EMPTY) as $palabra) {
            if (isset($lista[self::sinRepetidas($palabra)])) {
                return true;
            }
        }

        return false;
    }

    // "puuuuto" y "puto" son lo mismo.
    private static function sinRepetidas(string $palabra): string
    {
        return preg_replace('~(.)\1+~', '$1', $palabra);
    }
}
