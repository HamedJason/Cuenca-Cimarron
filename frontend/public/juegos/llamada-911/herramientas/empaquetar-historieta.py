"""Mete las viñetas de la historieta (img/historieta-1.webp ... -4.webp) dentro de
js/historieta-imagenes.js, para que se puedan colorear aunque el juego se abra con doble clic.

Uso (desde la carpeta del juego):  python herramientas/empaquetar-historieta.py
"""
import base64, json, os

raiz = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
datos = {}
for n in range(1, 5):
    ruta = os.path.join(raiz, "img", "historieta-%d.webp" % n)
    if os.path.exists(ruta):
        with open(ruta, "rb") as f:
            datos[str(n)] = "data:image/webp;base64," + base64.b64encode(f.read()).decode("ascii")
        print("cuadro %d: listo" % n)
    else:
        print("cuadro %d: falta img/historieta-%d.webp (el juego pone un cuadro para dibujar a mano)" % (n, n))

with open(os.path.join(raiz, "js", "historieta-imagenes.js"), "w", encoding="utf-8", newline="\n") as f:
    f.write("// Hecho por herramientas/empaquetar-historieta.py: no se edita a mano\n")
    f.write("window.HISTORIETA_IMG = " + json.dumps(datos, indent=0) + ";\n")
print("js/historieta-imagenes.js listo")
