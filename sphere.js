/*
 * An object type representing an implicit sphere.
 *
 * @param center A Vector3 object representing the position of the center of the sphere
 * @param radius A Number representing the radius of the sphere.
 */

var Sphere = function(center, radius,color) {
  // Sanity checks (your modification should be below this where indicated)
  if (!(this instanceof Sphere)) {
    console.error("Sphere constructor must be called with the new operator");
  }

  this.color = color;
  this.center = center;
  this.radius = radius;

  // todo - make sure this.center and this.radius are replaced with default values if and only if they
  // are invalid or undefined (i.e. center should be of type Vector3 & radius should be a Number)
  // - the default center should be the zero vector
  // - the default radius should be 1
  // YOUR CODE HERE
  if(this.center == undefined){
    this.center = new Vector3(0,0,0);
  }

  if(this.radius == undefined){
    this.radius =1; 
  }
  
  if(this.color == undefined){
    this.color = new Vector3(1,1,1);
  }

  // Sanity checks (your modification should be above this)
  if (!(this.center instanceof Vector3)) {
    console.error("The sphere center must be a Vector3");
  }

  if ((typeof(this.radius) != 'number')) {
    console.error("The radius must be a Number");
  }
};

Sphere.prototype = {
  
  //----------------------------------------------------------------------------- 
  raycast: function(r1) {
    // todo - determine whether the ray intersects this sphere and if so, where
     var hitpoint = null;
     var actualAlpha =0;
    // Recommended steps
    // ------------------
    // 0. (optional) watch the video showing the complete implementation of plane.js
    //    You may find it useful to see a different piece of geometry coded.

    // 1. review slides/book math
    
    // 2. identity the vectors needed to solve for the coefficients in the quadratic equation
    // r1, center

    // 3. calculate the discriminant
      // b^2-4ac  
    // 4. use the discriminant to determine if further computation is necessary 
    //    if (determinant...) { ... } else { ... }
    var a = 1; 
    var b=  (r1.direction.clone().multiplyScalar(2).dot(r1.origin.clone().subtract(this.center)));
    var c = (r1.origin.clone().subtract(this.center)).dot(r1.origin.clone().subtract(this.center))-(this.radius*this.radius);
    var discriminant= b*b-4*a*c;


    // 5. return the following object literal "result" based on whether the intersection
    //    is valid (i.e. the intersection is in front of the ray and the ray is not inside
    //    the sphere)
    //    case 1: no VALID intersections
    //      var result = { hit: false, point: null }
    //    case 2: 1 or more intersections
    //      var result = {
    //        hit: true,
    //        point: 'a Vector3 containing the closest VALID intersection',
    //        normal: 'a vector3 containing a unit length normal at the intersection point',
    //        distance: 'a scalar containing the intersection distance from the ray origin'
    //      }
      //no intersection case
      if(discriminant<0){
        return {hit: false, point:null}
      }
      //1 intersection 

      if(discriminant==0){
        var alpha = -b/2*a;

        if(alpha>0){
          hitpoint = r1.origin.clone().add(r1.direction.clone().multiplyScalar(alpha));
          actualAlpha = alpha;
        }else{
          return { hit:false, point:null}
        }
      }
      //2 intersections 
        else{
          var alpha1 = ((-b)+Math.sqrt(b*b-4*a*c))/2*a;
          var alpha2 = ((-b)-Math.sqrt(b*b-4*a*c))/2*a;
          if(alpha1>0 && alpha2 >0){
            if(alpha1>alpha2){
              hitpoint =r1.origin.clone().add(r1.direction.clone().multiplyScalar(alpha2));
              actualAlpha = alpha2;
            }else{
              hitpoint=r1.origin.clone().add(r1.direction.clone().multiplyScalar(alpha1));
              actualAlpha= alpha1;
            }
            
           //vector is negative or inside sphere 
          }else{
            return{hit:false,point:null}
          }
        }


    // An object created from a literal that we will return as our result
    // Replace the null values in the properties below with the right values
    var result = {
      hit: true,      // should be of type Boolean
      point: hitpoint,    // should be of type Vector3
      normal: (hitpoint.clone().subtract(this.center)).normalize(),   // should be of type Vector3
      distance: actualAlpha, // should be of type Number (scalar)
    };

    return result;
  }
}

// EOF 00100001-1