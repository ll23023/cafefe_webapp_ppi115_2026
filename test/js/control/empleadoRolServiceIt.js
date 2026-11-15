import * as chai from "../lib/chai/index.js";
import { EmpleadoRolService } from "../../../src/js/control/EmpleadoRolService.js";

mocha.setup('bdd');

describe("EmpleadoRolService", function() {
  it("instancia el servicio", function() {
    var cut = new EmpleadoRolService();
    chai.assert.isDefined(cut);
    chai.expect(cut).to.be.an.instanceOf(EmpleadoRolService);
  });

  it("consulta el rango real de registros", function(done) {
    var cut = new EmpleadoRolService();
    cut.findRange(0, 10)
      .then(function(resp) {
        chai.expect(resp).to.be.an('object');
        chai.expect(resp.registros).to.be.an('array');
        chai.expect(resp.total).to.be.a('number').and.to.be.at.least(0);
        done();
      })
      .catch(function(err) { done(err); });
  });

  it("consulta un registro real por su identificador cuando existe", function(done) {
    var cut = new EmpleadoRolService();
    cut.findRange(0, 1)
      .then(function(resp) {
        if (resp.registros.length === 0) {
          done();
          return;
        }

        var id = resp.registros[0].idEmpleadoRol;
        cut.findById(id)
          .then(function(registro) {
            chai.expect(registro).to.be.an('object');
            chai.expect(registro.idEmpleadoRol).to.equal(id);
            done();
          })
          .catch(function(err) { done(err); });
      })
      .catch(function(err) { done(err); });
  });
});

mocha.run();
