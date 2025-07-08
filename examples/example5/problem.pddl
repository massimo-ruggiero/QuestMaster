(define (problem hollow-moon-quest)
  (:domain whispers-of-the-hollow-moon)
  (:objects
    dreambound - agent
    waking-marshes temple-of-memory temple-of-mirrors temple-of-slumber temple-of-echoes skyvault-cradle - location
  )

  (:init
    (at dreambound waking-marshes)
    (identity-eroded)

    (can-reclaim astral-chime)
    (can-reclaim somniari-crest)
    (can-reclaim mirror-shard)
    (can-reclaim noctis-tear)

    (sigil-is-at astral-chime temple-of-memory)
    (sigil-is-at somniari-crest temple-of-mirrors)
    (sigil-is-at mirror-shard temple-of-slumber)
    (sigil-is-at noctis-tear temple-of-echoes)

    (ritual-site skyvault-cradle)

    (path waking-marshes temple-of-memory)
    (path temple-of-memory waking-marshes)
    (path waking-marshes temple-of-mirrors)
    (path temple-of-mirrors waking-marshes)
    (path waking-marshes skyvault-cradle)

    (path temple-of-memory temple-of-slumber)
    (path temple-of-slumber temple-of-memory)
    (path temple-of-mirrors temple-of-echoes)
    (path temple-of-echoes temple-of-mirrors)

    (path temple-of-slumber skyvault-cradle)
    (path temple-of-echoes skyvault-cradle)
  )

  (:goal (and
    (ritual-performed)
  ))
)