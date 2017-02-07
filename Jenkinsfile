import hudson.model.ParameterValue;
import hudson.model.ParametersAction;
def printParams() {
        println "calling print params"
        env.getEnvironment().each { name, value -> println "Name: $name -> Value $value" }
}
node {
    sh "env > env.txt" 
    for (String i : readFile('env.txt').split("\r?\n")) {
    println i
    }
}
