module("scrum board tests");

test("libraries", function(){
    expect(1);
    ok( !!window.jQuery, "jQuery global is present")
});

test("logger", function(){
    expect(1);
    var history = log.history && log.history.length || 0;
    log("logging from the test suite.")
    equals( log.history.length - history, 1, "log history keeps track" )
});



