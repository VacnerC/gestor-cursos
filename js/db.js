const DB_NAME = 'ProyectoCRUD';
const DB_VERSION = 2; // Incrementada para actualizar esquema de clientes
let db;

function openDb() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
            db = event.target.result;
            let clientesOS;
            if (!db.objectStoreNames.contains('clientes')) {
                clientesOS = db.createObjectStore('clientes', { keyPath: 'id', autoIncrement: true });
                clientesOS.createIndex('nombre', 'nombre', { unique: false });
                // Nuevos índices para curso y asesor
                clientesOS.createIndex('cursoId', 'cursoId', { unique: false });
                clientesOS.createIndex('asesorId', 'asesorId', { unique: false });
                clientesOS.createIndex('pago', 'pago', { unique: false });
            } else {
                // Si la tienda ya existe (actualización desde v1)
                clientesOS = event.target.transaction.objectStore('clientes');
                // Eliminar índice antiguo si existe
                if (clientesOS.indexNames.contains('curso')) {
                    clientesOS.deleteIndex('curso');
                }
                // Crear nuevos índices si no existen
                if (!clientesOS.indexNames.contains('cursoId')) {
                    clientesOS.createIndex('cursoId', 'cursoId', { unique: false });
                }
                if (!clientesOS.indexNames.contains('asesorId')) {
                    clientesOS.createIndex('asesorId', 'asesorId', { unique: false });
                }
            }
            if (!db.objectStoreNames.contains('cursos')) {
                const cursosOS = db.createObjectStore('cursos', { keyPath: 'id', autoIncrement: true });
                cursosOS.createIndex('nombre', 'nombre', { unique: false });
                cursosOS.createIndex('costo', 'costo', { unique: false });
                cursosOS.createIndex('categoria', 'categoria', { unique: false });
                // Añadir índice para imageUrl
                cursosOS.createIndex('imageUrl', 'imageUrl', { unique: false });
                // Añadir índice para descripción
                cursosOS.createIndex('descripcion', 'descripcion', { unique: false });
            } else {
                // Si la tienda ya existe, asegurarse de que el índice imageUrl exista
                const cursosOS = event.target.transaction.objectStore('cursos');
                if (!cursosOS.indexNames.contains('imageUrl')) {
                    cursosOS.createIndex('imageUrl', 'imageUrl', { unique: false });
                }
                // Asegurarse de que el índice descripcion exista
                if (!cursosOS.indexNames.contains('descripcion')) {
                    cursosOS.createIndex('descripcion', 'descripcion', { unique: false });
                }
            }
            if (!db.objectStoreNames.contains('asesores')) {
                const asesoresOS = db.createObjectStore('asesores', { keyPath: 'id', autoIncrement: true });
                asesoresOS.createIndex('nombre', 'nombre', { unique: false });
                // Corregido: 'cargo' en lugar de 'especialidad'
                asesoresOS.createIndex('cargo', 'cargo', { unique: false }); 
                // Eliminado: 'email' no estaba en los requisitos
            }
            console.log('IndexedDB: Base de datos actualizada/creada.');
        };

        request.onsuccess = (event) => {
            db = event.target.result;
            console.log('IndexedDB: Conexión exitosa.');
            resolve(db);
        };

        request.onerror = (event) => {
            console.error('IndexedDB error:', event.target.errorCode);
            reject('Error al abrir la base de datos.');
        };
    });
}

// --- Funciones CRUD para Asesores ---
function addAsesor(asesor) {
    return new Promise((resolve, reject) => {
        if (!db) {
            return reject('La base de datos no está abierta.');
        }
        const transaction = db.transaction(['asesores'], 'readwrite');
        const store = transaction.objectStore('asesores');
        const request = store.add(asesor);

        request.onsuccess = () => {
            resolve(request.result); // Devuelve el ID generado
        };
        request.onerror = (event) => {
            reject('Error al agregar asesor: ' + event.target.error);
        };
    });
}

function getAllAsesores() {
    return new Promise((resolve, reject) => {
        if (!db) {
            return reject('La base de datos no está abierta.');
        }
        const transaction = db.transaction(['asesores'], 'readonly');
        const store = transaction.objectStore('asesores');
        const request = store.getAll();

        request.onsuccess = () => {
            resolve(request.result);
        };
        request.onerror = (event) => {
            reject('Error al obtener asesores: ' + event.target.error);
        };
    });
}

function deleteAsesor(id) {
    return new Promise((resolve, reject) => {
        if (!db) { return reject('La base de datos no está abierta.'); }
        const transaction = db.transaction(['asesores'], 'readwrite');
        const store = transaction.objectStore('asesores');
        const request = store.delete(id);
        request.onsuccess = () => resolve();
        request.onerror = (event) => reject('Error al eliminar asesor: ' + event.target.error);
    });
}

function updateAsesor(asesor) {
    return new Promise((resolve, reject) => {
        if (!db) { return reject('La base de datos no está abierta.'); }
        const transaction = db.transaction(['asesores'], 'readwrite');
        const store = transaction.objectStore('asesores');
        const request = store.put(asesor); // put actualiza si existe, o inserta si no
        request.onsuccess = () => resolve();
        request.onerror = (event) => reject('Error al actualizar asesor: ' + event.target.error);
    });
}

// --- Funciones CRUD para Clientes ---
function addCliente(cliente) {
    return new Promise((resolve, reject) => {
        if (!db) { return reject('La base de datos no está abierta.'); }
        const transaction = db.transaction(['clientes'], 'readwrite');
        const store = transaction.objectStore('clientes');
        const request = store.add(cliente);
        request.onsuccess = () => resolve(request.result);
        request.onerror = (event) => reject('Error al agregar cliente: ' + event.target.error);
    });
}

function getAllClientes() {
    return new Promise((resolve, reject) => {
        if (!db) { return reject('La base de datos no está abierta.'); }
        const transaction = db.transaction(['clientes'], 'readonly');
        const store = transaction.objectStore('clientes');
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = (event) => reject('Error al obtener clientes: ' + event.target.error);
    });
}

function deleteCliente(id) {
    return new Promise((resolve, reject) => {
        if (!db) { return reject('La base de datos no está abierta.'); }
        const transaction = db.transaction(['clientes'], 'readwrite');
        const store = transaction.objectStore('clientes');
        const request = store.delete(id);
        request.onsuccess = () => resolve();
        request.onerror = (event) => reject('Error al eliminar cliente: ' + event.target.error);
    });
}

function updateCliente(cliente) {
    return new Promise((resolve, reject) => {
        if (!db) { return reject('La base de datos no está abierta.'); }
        const transaction = db.transaction(['clientes'], 'readwrite');
        const store = transaction.objectStore('clientes');
        const request = store.put(cliente);
        request.onsuccess = () => resolve();
        request.onerror = (event) => reject('Error al actualizar cliente: ' + event.target.error);
    });
}

// --- Funciones CRUD para Cursos ---
function addCurso(curso) {
    return new Promise((resolve, reject) => {
        if (!db) { return reject('La base de datos no está abierta.'); }
        const transaction = db.transaction(['cursos'], 'readwrite');
        const store = transaction.objectStore('cursos');
        const request = store.add(curso);
        request.onsuccess = () => resolve(request.result);
        request.onerror = (event) => reject('Error al agregar curso: ' + event.target.error);
    });
}

function getAllCursos() {
    return new Promise((resolve, reject) => {
        if (!db) { return reject('La base de datos no está abierta.'); }
        const transaction = db.transaction(['cursos'], 'readonly');
        const store = transaction.objectStore('cursos');
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = (event) => reject('Error al obtener cursos: ' + event.target.error);
    });
}

function getCursoById(id) {
    return new Promise((resolve, reject) => {
        if (!db) {
            return reject('La base de datos no está abierta.');
        }
        const transaction = db.transaction(['cursos'], 'readonly');
        const store = transaction.objectStore('cursos');
        const request = store.get(id);
        request.onsuccess = (event) => {
            resolve(event.target.result);
        };
        request.onerror = (event) => {
            reject(event.target.error);
        };
    });
}

function deleteCurso(id) {
    return new Promise((resolve, reject) => {
        if (!db) { return reject('La base de datos no está abierta.'); }
        const transaction = db.transaction(['cursos'], 'readwrite');
        const store = transaction.objectStore('cursos');
        const request = store.delete(id);
        request.onsuccess = () => resolve();
        request.onerror = (event) => reject('Error al eliminar curso: ' + event.target.error);
    });
}

function updateCurso(curso) {
    return new Promise((resolve, reject) => {
        if (!db) { return reject('La base de datos no está abierta.'); }
        const transaction = db.transaction(['cursos'], 'readwrite');
        const store = transaction.objectStore('cursos');
        const request = store.put(curso);
        request.onsuccess = () => resolve();
        request.onerror = (event) => reject('Error al actualizar curso: ' + event.target.error);
    });
}

// Abrir la base de datos al cargar el script
openDb().catch(error => console.error(error));