(define (problem retrieve-relic)
  (:domain sunken-temple)

  (:init
    (at thalara-harbor)
    (has-gear stabilizer)
    (stormy-sea)
    (poor-visibility)
    (creature-at guardian-eels sanctum)

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