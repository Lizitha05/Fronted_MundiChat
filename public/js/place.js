//console.log("Window Location:", window.location);

const copyToClipboard = async () => {
    try {
        const ubi = document.getElementById("ubicacionLugar").innerText
        await navigator.clipboard.writeText(ubi)
        alert('Se ha copiado la ubicación del lugar.')
    } catch (error) {
        console.log(error)
        alert('Ha ocurrido un error. Intente mas tarde.')
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const myKeysValues = window.location.search;
    //console.log("Lugar:", myKeysValues);

    const urlParams = new URLSearchParams(myKeysValues);

    const lugar = urlParams.get('lugar')

    console.log("Lugar:", lugar);

    const lugares = {
        paseo: {
            nombre: "PASEO SANTA LUCÍA",
            descripcion: "Un hermoso lugar para recorrer en compañía y disfrutar de los maravillosos atractivos turísticos.",
            detalles: "En la actualidad, el paseo Santa Lucía es el río artificial más largo de América Latina con una extensión de 2.5 kilómetros y es considerado como una de las 13 maravillas de México creadas por el hombre. Es el lugar preferencial de los neoleoneses para pasear por las tardes y fines de semana, así como un destino turístico mundial.",
            ubicacion: "https://maps.app.goo.gl/dxjMkkYHYqrx7AbP8"
        },
        fundidora: {
            nombre: "PARQUE FUNDIDORA",
            descripcion: "El pulmón verde de la ciudad, lugar de eventos varios y recuerdos memorables.",
            detalles: "El Parque Fundidora cuenta con una extensión de 144 hectáreas, de las cuales 76 son áreas verdes. A lo largo de las instalaciones se pueden encontrar El Horno 3 (declarado monumento artístico nacional), el Museo del Acero, la Escuela Adolfo Prieto, la Nave Generadores, el Centro de Exposiciones Nave Lewis, la Arena Monterrey, Cintermex, el Archivo Histórico de N.L. y el antiguo Circuito Parque Fundidora, ahora utilizado como ruta de movilidad peatonal y ciclista.",
            ubicacion: "https://maps.app.goo.gl/KhFYFpekwroi9V1HA"
        },
        macroplaza: {
            nombre: "MACROPLAZA",
            descripcion: "La plaza mas grande de México, repleta de comercios, zonas de recreo y áreas verdes.",
            detalles: "El proyecto de la Gran Plaza fue una iniciativa de rediseño urbano propuesta por el gobierno de Alfonso Martínez Domingues, que tenía la finalidad de renovar el centro de Monterrey. Dicho proyecto retomaba una propuesta urbanística realizada por el arquitecto Eduardo Padilla Martínez-Negrete en 1969, que conectaba el Palacio Municipal de Monterrey con el Palacio de Gobierno por medio de un corredor público.",
            ubicacion: "https://maps.app.goo.gl/ZJ61SSdgW29W1YxQ6"
        },
        barrio: {
            nombre: "BARRIO ANTIGUO",
            descripcion: "El barrio histórico del área metropolitana, con sus edificios coloniales y avivada vida nocturna.",
            detalles: "El área contigua al Palacio de Gobierno y la Macroplaza, originalmente abarcaba un espacio mayor desde el río Santa Catarina hasta la calle 5 de Mayo, de sur a norte, y desde la calle Mina hasta la calle Roble (actualmente Avenida Benito Juárez), de este a oeste. La mayoría de los edificios que se conservan son de la época colonial española y de los últimos años del siglo XIX.",
            ubicacion: "https://maps.app.goo.gl/1hjesC1XhH5LvfNv7"
        },
        cerro: {
            nombre: "CERRO DE LA SILLA",
            descripcion: "Mayor ícono de la ciudad, parte de la Sierra Madre Oriental e ideal para el senderismo.",
            detalles: "La conservación del Monumento natural Cerro de la Silla es de importancia trascendental para el área metropolitana de Monterrey, pues constituye un patrimonio natural con una importante función socioeconómica que incluye la preservación de recursos como el agua, el aire, el suelo, la flora y la fauna; elementos que representan servicios ambientales para la Ciudad de Monterrey.",
            ubicacion: "https://maps.app.goo.gl/BdwPCCaDmG78bBXi9"
        },
        chipinque: {
            nombre: "RESERVA CHIPINQUE",
            descripcion: "Área natural protegida, dedicada a la conservación, educación y recreación responsables.",
            detalles: "La misión del Parque Ecológico Chipinque es conservar la biodiversidad a través de un manejo integrado que asegure la conservación de sus recursos naturales, que a su vez promueve el respeto y la apreciación, del ecosistema y la geografía del lugar. El Parque es conocido por su belleza y diversidad de flora y fauna, en donde además, se encuentran pinos, mezquites, cenizos, entre otros.",
            ubicacion: "https://maps.app.goo.gl/Hc3469ckWMMfyAsaA"
        },
        marco: {
            nombre: "MUSEO DE ARTE CONTEMPORÁNEO",
            descripcion: "Uno de los centros culturales mas importantes de Ámerica Latina, difusor de las artes visuales.",
            detalles: "En el museo se crearon diferentes ambientes y atmósferas en cada rincón, provocando que la visita al museo sea una experiencia única. Para ello creó un edificio que corresponde no sólo al lugar urbano y a Monterrey, sino a todo el pueblo mexicano, mostrando el arte en un ambiente mucho más natural y menos artificial que como se hace en otras partes del mundo.",
            ubicacion: "https://maps.app.goo.gl/He7C1XxPmkiNgvkP7"
        },
        mirador: {
            nombre: "MIRADOR DEL OBISPADO",
            descripcion: "Lugar de la segunda bandera monumental mas grande de México, con la mejor vista de la ciudad.",
            detalles: "A una altitud de 775 metros sobre el nivel del mar, el mirador consiste en una explanada circular de 40 metros de diámetro con el asta bandera en su centro. Hay bancas, un pequeño estacionamiento (primeramente para gente discapacitada) y 3 jardines de tipo francés. Las instalaciones están equipadas con bebederos y tocadores.",
            ubicacion: "https://maps.app.goo.gl/1Fb5mJkafvuo3E2E6"
        },
        grutas: {
            nombre: "GRUTAS DE GARCÍA",
            descripcion: "Un conjunto de cuevas localizadas en el municipio de garcía, un área natural protegida de la Sierra del Fraile.",
            detalles: "Las grutas están rodeadas por un paisaje desértico y rocoso en el que existen numerosas cavernas. Son una extensa serie de galerías con una antigüedad de entre 50 y 60 millones de años. Poseen una longitud total de 300 metros y una profundidad máxima de 105 metros. Durante épocas prehistóricas estuvieron sumergidas bajo el mar. Por esta razón, en sus partes se pueden observar restos de fósiles marinos, como conchas y caracoles.",
            ubicacion: "https://maps.app.goo.gl/q8N3325sDFHD4zDn6"
        }
    }

    if(lugar){
        document.getElementById("fotoLugar").src = "../Image/" + lugar + ".jpg";
        document.getElementById("tituloLugar").textContent = lugares[lugar].nombre;
        document.getElementById("descripcionLugar").textContent = lugares[lugar].descripcion;
        document.getElementById("detallesLugar").textContent = lugares[lugar].detalles;
        document.getElementById("ubicacionLugar").textContent = lugares[lugar].ubicacion;
    }


});

