(function(angular, factory) {
  if (typeof define === 'function' && define.amd) {
    define('pdf-annotation', ['angular'], function(angular) {
      return factory(angular);
    });
  } else {
    return factory(angular);
  }
}(typeof angular === 'undefined' ? null : angular, function(angular) {

  var module = angular.module('pdfAnnotation', []);
  
  'use strict';
  
  module.directive('pdfAnnotation', function () {
    return {
      restrict: 'E',
      scope: {
        options: '=',
        callbackFn: '&',
        closeFn: '&'
      },
      transclude: true,
      templateUrl: 'bower_components/pdf-annotation/src/directives/directive.html',
      link: function (scope, element, attrs, ctrl) {
          console.log('In PDF Annotation Directive LInk function');        
      }
    }
  });
}));