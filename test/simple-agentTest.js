var expect = require('chai').expect;
var FunctionApproximator = require('function-approximator').FunctionApproximator;

var SimpleAgent = require('../index').SimpleAgent;

describe('Simple Agent', function() {
    it('should exist', function() {
	expect(SimpleAgent).to.exist;
    });
    it('should be instantiated', function() {
	expect(new SimpleAgent()).to.exist;
    });

    it('should be able to ask a problemSystem for possibilities in that systems world', function() {
	var problemMock = {};
	    problemMock.getPossibleActions = function() {
		return [{state: {x: 0}, action: "left"},
			{state: {x: 2}, action: "right"}
		       ];
	    }

	var a = new SimpleAgent(problemMock);
	expect(a.getPossibleActions()).to.deep.equal(problemMock.getPossibleActions());
    });

     describe('should choose an action from possible states using some solver', function() {
	 it('case1: mock returns first state', function() {
	     var problemMock = {};
	     problemMock.getPossibleActions = function() {
		 return [{state: {x: 0}, action: "left"},
			 {state: {x: 2}, action: "right"}

			];
	     }

	     var solverMock = {};
	     solverMock.evaluate = function(states) {
		 return states[0];
	     }
	     var a = new SimpleAgent(problemMock, solverMock);
	     expect(a.chooseAction()).to.deep.equal({state: {x: 0}, action: "left"});
	 });

	 it('case2: mock returns second state', function() {
	     var problemMock = {};
	     problemMock.getPossibleActions = function() {
		 return [{state: {x: 0}, action: "left"},
			 {state: {x: 2}, action: "right"}

			];
	     }

	     var solverMock = {};
	     solverMock.evaluate = function(states) {
		 return states[1];
	     }
	     var a = new SimpleAgent(problemMock, solverMock);
	     expect(a.chooseAction()).to.deep.equal({state: {x: 2}, action: "right"});
	 });
	 it('case3: using an actual instantiation of a function approximator', function() {
	     var problemMock = {};
	     problemMock.getPossibleActions = function() {
		 return [{state: {x: 0}, action: "left"},
			 {state: {x: 2}, action: "right"}

			];
	     }

	     var nonexplorerfa = new FunctionApproximator(null,null,0,null);
	     nonexplorerfa.addValueFunction(
		 nonexplorerfa.createValueFunction(function(s) { return s.x; } )
	     );

	     var a = new SimpleAgent(problemMock, nonexplorerfa);
	     expect(a.chooseAction()).to.deep.equal({state: {x: 2}, action: "right"});
	 });
     });
    it('should be instantiated with a tick of 0, meaning it hasnt done anything to manipulate the problem', function() {
	var sa = new SimpleAgent();
	expect(sa.getTicked()).to.equal(0);
    });

    it('should ticked++ when an action is performed', function() {
	 var problemMock = {};
	     problemMock.tick = function() {}
	     problemMock.currentState = function() {return 0;}

	var sa = new SimpleAgent(problemMock);
	expect(sa.getTicked()).to.equal(0);
	sa.performAction("left");
	expect(sa.getTicked()).to.equal(1);

    })

    it('should know how many actions it performed', function() {
	 var problemMock = {
	     i: 0
	 };
	     problemMock.tick = function() {
		 this.i++;
	     }
	     problemMock.currentState = function() {
		 return {x: this.i};
	     }


	var sa = new SimpleAgent(problemMock);

	sa.performAction("right");
	expect(problemMock.i).to.equal(1);
	expect(problemMock.currentState()).to.deep.equal({x: 1});

	sa.performAction("right");
	expect(problemMock.i).to.equal(2);
 	expect(problemMock.currentState()).to.deep.equal({x: 2});

    });

    it('should keep a history of all its transitioned states', function() {
	var problemMock = {
	    i: 0
	};
	problemMock.tick = function() {
	    this.i++;
	}
	problemMock.currentState = function() {
	    return {x: this.i};
	}


	var sa = new SimpleAgent(problemMock);

	sa.performAction("right");
	sa.performAction("root");
	sa.performAction("right");

	expect(sa.history.length).to.equal(3);
	expect(sa.history).to.deep.equal( [{state: {x:0}, action: "right"}, {state: {x:1}, action: "root"}, {state: {x:2}, action: "right"}]);
    });

    it('should reeavaluate all weights for each of its chosen actions', function() {
	var problemMock = {
	    i: 0
	};
	problemMock.tick = function() {
	    this.i++;
	}
	problemMock.currentState = function() {
	    return {x: this.i};
	}

	var counter = 0;
	var solverMock = {};

	solverMock.correct = function() {
	    counter++;
	}
	var a = new SimpleAgent(problemMock, solverMock);

	a.performAction("right");
	a.performAction("root");
	a.performAction("right");


	a.reevaluateActions();
	expect(counter).to.equal(3);
	a.performAction("right");
	a.performAction("root");
	a.performAction("right");

	a.reevaluateActions();
	expect(counter).to.equal(6)
    });

});
