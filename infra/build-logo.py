"""Regenerates the standalone, outlined logo. Requires fonttools (Python)."""
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen

root = Path(__file__).resolve().parents[1]
font = TTFont(root / 'frontend/node_modules/@fontsource/barlow-condensed/files/barlow-condensed-latin-700-normal.woff')
glyphs = font.getGlyphSet()
cmap = font.getBestCmap()
units = font['head'].unitsPerEm

def outline(text, x, y, size, tracking=0, color='#00723F'):
    scale = size / units
    paths = []
    for char in text:
        name = cmap[ord(char)]
        pen = SVGPathPen(glyphs)
        glyphs[name].draw(TransformPen(pen, (scale, 0, 0, -scale, x, y)))
        paths.append(f'<path fill="{color}" d="{pen.getCommands()}"/>')
        x += glyphs[name].width * scale + tracking
    return ''.join(paths)

mascot = (root / 'frontend/public/brand/cimarron.svg').read_text(encoding='utf-8')
body = mascot.split('>', 1)[1].rsplit('</svg>', 1)[0]
logo = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 550 210"><title>Cuenca Cimarrón</title>'
logo += f'<g transform="translate(5 5)">{body}</g>'
logo += outline('CUENCA', 226, 80, 55, 6)
logo += outline('CIMARRÓN', 223, 151, 79, 0)
logo += '<circle cx="525" cy="146" r="5" fill="#DD971A"/>'
logo += outline('CONOCER. PREVENIR. CUIDARNOS.', 226, 181, 18, 1.4)
logo += '</svg>'
(root / 'frontend/public/brand/cuenca-logo.svg').write_text(logo, encoding='utf-8')
print('Logo SVG autónomo generado con texto convertido a trazos.')
