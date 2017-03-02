node {
  for (int i=0; i< 2; ++i) {  
    stage "Stage #"+i
    print 'Hello, world $i!'
  }

  stage "Stage Parallel"
  def branches = [:]
  for (int i = 0; i < numHelloMessages.toInteger(); i++) {
    branches["split${i}"] = {
      stage "Stage parallel- #"+i
      node('remote') {
       echo  'Starting sleep'
       sleep 10
       echo  'Finished sleep'
      }
    }
  }
  parallel branches
}
