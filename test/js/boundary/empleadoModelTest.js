import * as chai from "../lib/chai/index.js";
import sinon from "../lib/sinon/sinon-esm.js";
import { EmpleadoModel } from "../../../src/js/boundary/EmpleadoModel.js";

mocha.setup('tdd');

let modelo;
let findRangeStub;
let findByIdStub;
let createStub;
let updateStub;
let deleteStub;
let registrosStubResult;

suite('EmpleadoModel', function() {
  setup(function() {
    modelo = new EmpleadoModel();
    registrosStubResult = [{ id: 'registro-1' }, { id: 'registro-2' }];
    findRangeStub = sinon.stub(modelo.service, 'findRange').resolves({
      registros: registrosStubResult,
      total: 2
    });
    findByIdStub = sinon.stub(modelo.service, 'findById').resolves({ id: 'registro-1' });
    createStub = sinon.stub(modelo.service, 'create').resolves('registro-creado');
    updateStub = sinon.stub(modelo.service, 'update').resolves({ id: 'registro-actualizado' });
    deleteStub = sinon.stub(modelo.service, 'delete').resolves();
  });

  teardown(function() {
    sinon.restore();
  });

  test('cargar almacena los registros y el total', function(done) {
    modelo.cargar()
      .then(function(registros) {
        chai.expect(registros).to.equal(registrosStubResult);
        chai.expect(modelo.registros).to.have.lengthOf(2);
        chai.expect(modelo.total).to.equal(2);
        done();
      })
      .catch(function(err) { done(err); });
  });

  test('nuevo y cancelar transitan entre CREAR y NADA', function() {
    modelo.nuevo();
    chai.expect(modelo.estado).to.equal('CREAR');
    modelo.cancelar();
    chai.expect(modelo.estado).to.equal('NADA');
    chai.expect(modelo.registro).to.equal(null);
  });

  test('seleccionar carga el registro y transita a MODIFICAR', function(done) {
    modelo.seleccionar('registro-1')
      .then(function(registro) {
        chai.expect(registro.id).to.equal('registro-1');
        chai.expect(modelo.estado).to.equal('MODIFICAR');
        done();
      })
      .catch(function(err) { done(err); });
  });

  test('guardar detiene el envío cuando falla la validación local', function(done) {
    modelo.registro = {
      validar: function() { return { nombre: 'Campo obligatorio' }; }
    };
    modelo.estado = 'CREAR';

    modelo.guardar()
      .then(function(resultado) {
        chai.expect(resultado).to.equal(null);
        chai.expect(modelo.erroresValidacion.nombre).to.equal('Campo obligatorio');
        chai.expect(createStub.called).to.be.false;
        done();
      })
      .catch(function(err) { done(err); });
  });

  test('guardar crea y restablece el estado', function(done) {
    modelo.nuevo();
    if (modelo.registro && typeof modelo.registro.validar === 'function') {
      modelo.registro.validar = function() { return {}; };
    }

    modelo.guardar()
      .then(function(id) {
        chai.expect(id).to.equal('registro-creado');
        chai.expect(createStub.calledOnce).to.be.true;
        chai.expect(modelo.estado).to.equal('NADA');
        done();
      })
      .catch(function(err) { done(err); });
  });

  test('modificar actualiza el registro y restablece el estado', function(done) {
    modelo.nuevo();
    if (modelo.registro && typeof modelo.registro.validar === 'function') {
      modelo.registro.validar = function() { return {}; };
    }

    modelo.modificar('registro-1')
      .then(function(actualizado) {
        chai.expect(actualizado.id).to.equal('registro-actualizado');
        chai.expect(updateStub.calledOnce).to.be.true;
        chai.expect(modelo.estado).to.equal('NADA');
        done();
      })
      .catch(function(err) { done(err); });
  });

  test('eliminar borra el registro y recarga', function(done) {
    modelo.eliminar('registro-1')
      .then(function(resultado) {
        chai.expect(resultado).to.equal(true);
        chai.expect(deleteStub.calledOnce).to.be.true;
        chai.expect(findRangeStub.called).to.be.true;
        done();
      })
      .catch(function(err) { done(err); });
  });

  test('cargar conserva y propaga los errores del servicio', function(done) {
    var causa = new Error('Error de carga');
    findRangeStub.rejects(causa);

    modelo.cargar()
      .then(function() { done(new Error('Se esperaba un error de carga')); })
      .catch(function(err) {
        chai.expect(err).to.equal(causa);
        chai.expect(modelo.error).to.equal('Error de carga');
        done();
      });
  });
});

mocha.run();
