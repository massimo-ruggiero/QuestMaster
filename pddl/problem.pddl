(define (problem find-sherpa)
  (:domain sherpa-quest)
  (:objects
    massimo-e-ciccio - protagonist
    quattromiglia-streets new-district friends-house dealers-spot - location
    illegal-sherpa - substance
  )
  (:init
    (at massimo-e-ciccio quattromiglia-streets)
    (is-desperate massimo-e-ciccio)
    (shopkeeper-is-angry)
    (dealers-are-gone)
  )
  (:goal (and
    (has-obtained massimo-e-ciccio illegal-sherpa)
  ))
)