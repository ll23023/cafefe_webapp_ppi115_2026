import * as chai from "../lib/chai/index.js";
import sinon from "../lib/sinon/sinon-esm.js";
import { DescuentoService } from "../../../src/js/control/DescuentoService.js";

mocha.setup('tdd');

let servicio;
let fetchStub;

suite('DescuentoService', function() {
  setup(function() {
    servicio = new DescuentoService();
    fetchStub = sinon.stub(window, 'fetch');
  });

  teardown(function() {
    sinon.restore();
  });

  test('findRange devuelve registros y total', function(done) {
    fetchStub.resolves(new Response(JSON.stringify([{}, {}]), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Total-Records': '2' }
    }));

    servicio.findRange(0, 10)
      .then(function(resp) {
        chai.expect(resp).to.be.an('object');
        chai.expect(resp.registros).to.be.an('array').with.lengthOf(2);
        chai.expect(resp.total).to.equal(2);
        done();
      })
      .catch(function(err) { done(err); });
  });

  test('create devuelve el identificador de Location', function(done) {
    fetchStub.resolves(new Response(null, {
      status: 201,
      headers: { 'Location': '/recurso/id-creado' }
    }));

    servicio.create({
  nombre: 'Elemento de prueba', apellido: 'Prueba', activo: true, comentarios: '',
  observaciones: 'Prueba', cliente: 'Cliente de prueba', estado: 'ACTIVA',
  precio: 1, precioSugerido: 1, monto: 1, cantidad: 1, tipoPago: 'EFECTIVO',
  idCaja: 'caja-id', idEmpleado: 'empleado-id', idEmpleadoRol: 'empleado-rol-id',
  idRol: 'rol-id', idFactura: 'factura-id', idPago: 'pago-id',
  idOrden: 'orden-id', idOrdenProducto: 'orden-producto-id', idProducto: 'producto-id'
})
      .then(function(id) {
        chai.expect(id).to.equal('id-creado');
        done();
      })
      .catch(function(err) { done(err); });
  });

  test('update devuelve el registro actualizado', function(done) {
    fetchStub.resolves(new Response(JSON.stringify({}), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    }));

    servicio.update('registro-id', {
  nombre: 'Elemento de prueba', apellido: 'Prueba', activo: true, comentarios: '',
  observaciones: 'Prueba', cliente: 'Cliente de prueba', estado: 'ACTIVA',
  precio: 1, precioSugerido: 1, monto: 1, cantidad: 1, tipoPago: 'EFECTIVO',
  idCaja: 'caja-id', idEmpleado: 'empleado-id', idEmpleadoRol: 'empleado-rol-id',
  idRol: 'rol-id', idFactura: 'factura-id', idPago: 'pago-id',
  idOrden: 'orden-id', idOrdenProducto: 'orden-producto-id', idProducto: 'producto-id'
})
      .then(function(resp) {
        chai.expect(resp).to.be.an('object');
        chai.expect(fetchStub.calledOnce).to.be.true;
        done();
      })
      .catch(function(err) { done(err); });
  });

  test('delete completa la solicitud', function(done) {
    fetchStub.resolves(new Response(null, { status: 204 }));

    servicio.delete('registro-id')
      .then(function() {
        chai.expect(fetchStub.calledOnce).to.be.true;
        done();
      })
      .catch(function(err) { done(err); });
  });

  test('propaga errores HTTP', function(done) {
    fetchStub.resolves(new Response(JSON.stringify({ error: 'Error de prueba' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    }));

    servicio.findRange(0, 10)
      .then(function() { done(new Error('Se esperaba un error HTTP')); })
      .catch(function(err) {
        chai.expect(err.message).to.equal('Error de prueba');
        done();
      });
  });
});

mocha.run();
