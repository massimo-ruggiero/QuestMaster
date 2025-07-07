(define (problem retrieve-relic)
  (:domain sunken-temple)

  (:init
    ;; Starting conditions
    (at thalara-harbor)
    (has-gear stabilizer)
    (stormy-sea)
    (poor-visibility)
    (creature-at guardian-eels sanctum)

    ;; Connectivity
    (path-open thalara-harbor dive-vessel)
    (path-open dive-vessel coral-chasm)
    (path-open coral-chasm eastern-hall)
    (path-open eastern-hall sanctum)
  )

  (:goal (and
    (relic-secured)
    (safe-on-surface)
  ))
)